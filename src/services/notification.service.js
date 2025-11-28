const { getMessaging } = require("../config/firebase");
const { Farmer, Ing } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const logger = require("../config/logger");
const { Op } = require("sequelize");

/**
 * Notification Service
 */
class NotificationService {
  /**
   * Send notification to a single device
   */
  static async sendToDevice(fcmToken, notification, data = {}) {
    const messaging = getMessaging();

    if (!messaging) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Firebase not initialized. Push notifications are disabled."
      );
    }

    if (!fcmToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "FCM token is required");
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        ...(notification.image && { image: notification.image }),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await messaging.send(message);
      logger.info(`Successfully sent notification: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      logger.error("Error sending notification:", error);
      
      // Handle invalid token errors
      if (error.code === "messaging/invalid-registration-token" || 
          error.code === "messaging/registration-token-not-registered") {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid or expired FCM token. Please update your token."
        );
      }
      
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to send notification: ${error.message}`
      );
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToMultipleDevices(fcmTokens, notification, data = {}) {
    const messaging = getMessaging();

    if (!messaging) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Firebase not initialized. Push notifications are disabled."
      );
    }

    if (!fcmTokens || fcmTokens.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "At least one FCM token is required");
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        ...(notification.image && { image: notification.image }),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      tokens: fcmTokens.filter(token => token && token.trim() !== ""),
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      logger.info(`Successfully sent ${response.successCount} notifications`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      logger.error("Error sending multicast notification:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to send notifications: ${error.message}`
      );
    }
  }

  /**
   * Send notification to all farmers
   */
  static async sendToAllFarmers(notification, data = {}) {
    try {
      const farmers = await Farmer.findAll({
        where: {
          fcmToken: {
            [Op.ne]: null,
          },
        },
        attributes: ["fcmToken"],
      });

      const tokens = farmers
        .map((farmer) => farmer.fcmToken)
        .filter((token) => token && token.trim() !== "");

      if (tokens.length === 0) {
        return {
          success: true,
          successCount: 0,
          failureCount: 0,
          message: "No farmers with FCM tokens found",
        };
      }

      return await this.sendToMultipleDevices(tokens, notification, data);
    } catch (error) {
      logger.error("Error sending notification to all farmers:", error);
      throw error;
    }
  }

  /**
   * Send notification to all engineers
   */
  static async sendToAllEngineers(notification, data = {}) {
    try {
      const engineers = await Ing.findAll({
        where: {
          fcmToken: {
            [Op.ne]: null,
          },
        },
        attributes: ["fcmToken"],
      });

      const tokens = engineers
        .map((engineer) => engineer.fcmToken)
        .filter((token) => token && token.trim() !== "");

      if (tokens.length === 0) {
        return {
          success: true,
          successCount: 0,
          failureCount: 0,
          message: "No engineers with FCM tokens found",
        };
      }

      return await this.sendToMultipleDevices(tokens, notification, data);
    } catch (error) {
      logger.error("Error sending notification to all engineers:", error);
      throw error;
    }
  }

  /**
   * Send notification to specific farmer
   */
  static async sendToFarmer(farmerId, notification, data = {}) {
    try {
      const farmer = await Farmer.findByPk(farmerId);

      if (!farmer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
      }

      if (!farmer.fcmToken) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Farmer does not have an FCM token registered"
        );
      }

      return await this.sendToDevice(farmer.fcmToken, notification, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error sending notification to farmer:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to send notification to farmer: ${error.message}`
      );
    }
  }

  /**
   * Send notification to specific engineer
   */
  static async sendToEngineer(engineerId, notification, data = {}) {
    try {
      const engineer = await Ing.findByPk(engineerId);

      if (!engineer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
      }

      if (!engineer.fcmToken) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Engineer does not have an FCM token registered"
        );
      }

      return await this.sendToDevice(engineer.fcmToken, notification, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error sending notification to engineer:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to send notification to engineer: ${error.message}`
      );
    }
  }

  /**
   * Update FCM token for farmer
   */
  static async updateFarmerToken(farmerId, fcmToken) {
    try {
      const farmer = await Farmer.findByPk(farmerId);

      if (!farmer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
      }

      await farmer.update({ fcmToken });
      logger.info(`FCM token updated for farmer ${farmerId}`);

      return farmer;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error updating farmer FCM token:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to update FCM token: ${error.message}`
      );
    }
  }

  /**
   * Update FCM token for engineer
   */
  static async updateEngineerToken(engineerId, fcmToken) {
    try {
      const engineer = await Ing.findByPk(engineerId);

      if (!engineer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
      }

      await engineer.update({ fcmToken });
      logger.info(`FCM token updated for engineer ${engineerId}`);

      return engineer;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error updating engineer FCM token:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to update FCM token: ${error.message}`
      );
    }
  }
}

module.exports = NotificationService;


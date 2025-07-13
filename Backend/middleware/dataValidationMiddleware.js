import { scheduledDataCleanup } from '../utils/dataValidation.js';

/**
 * Middleware to run data validation and cleanup
 */

let validationInterval = null;

/**
 * Initialize data validation middleware
 * @param {Object} options - Configuration options
 */
export const initializeDataValidation = (options = {}) => {
  const {
    runOnStartup = true,
    intervalMinutes = 60, // Run every hour by default
    autoFix = false
  } = options;

  // Run validation on startup
  if (runOnStartup) {
    setTimeout(async () => {
      try {

        await scheduledDataCleanup();

      } catch (error) {
        console.error('❌ Startup data validation failed:', error.message);
      }
    }, 5000); // Wait 5 seconds after startup
  }

  // Set up periodic validation
  if (intervalMinutes > 0) {
    validationInterval = setInterval(async () => {
      try {

        await scheduledDataCleanup();

      } catch (error) {
        console.error('❌ Scheduled data validation failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);

  }
};

/**
 * Stop the data validation interval
 */
export const stopDataValidation = () => {
  if (validationInterval) {
    clearInterval(validationInterval);
    validationInterval = null;

  }
};

/**
 * Express middleware to validate data on specific routes
 */
export const validateDataMiddleware = (options = {}) => {
  const { autoFix = false } = options;

  return async (req, res, next) => {
    try {
      // Only run validation on specific routes or conditions
      const shouldValidate = req.path.includes('/participants') || req.query.validate === 'true';
      
      if (shouldValidate) {

        const { validateDataIntegrity } = await import('../utils/dataValidation.js');
        
        const report = await validateDataIntegrity({ 
          autoFix,
          checkParticipantEvents: true 
        });
        
        // Add validation report to request for use in controllers
        req.validationReport = report;
        
        if (report.summary.totalIssues > 0) {
          console.warn(`⚠️ Found ${report.summary.totalIssues} data integrity issues`);
        }
      }
      
      next();
    } catch (error) {
      console.error('❌ Data validation middleware error:', error.message);
      // Don't block the request, just log the error
      next();
    }
  };
};

export default {
  initializeDataValidation,
  stopDataValidation,
  validateDataMiddleware
};
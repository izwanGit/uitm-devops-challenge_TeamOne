/**
 * Property Approval Settings
 * Centralized store for approval configuration to avoid circular dependencies
 */

const approvalSettings = {
  autoApprove: {
    isEnabled: false, // Default: OFF (manual approval required)
    lastUpdated: new Date(),
    updatedBy: null,
  },
};

module.exports = {
  getSettings: () => approvalSettings.autoApprove,

  updateSettings: (isEnabled, adminId) => {
    approvalSettings.autoApprove.isEnabled = isEnabled;
    approvalSettings.autoApprove.lastUpdated = new Date();
    approvalSettings.autoApprove.updatedBy = adminId;
    return approvalSettings.autoApprove;
  },
};

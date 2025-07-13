/**
 * Automatic Amount Field Synchronization Helper
 * This utility ensures ALL amount fields are always synchronized
 */

/**
 * Synchronizes all amount fields for a claim item based on its status
 * @param {Object} item - The claim item to synchronize
 * @param {number} approvedAmount - Optional approved amount for approved items
 * @returns {Object} - The synchronized item
 */
export const syncAmountFields = (item, approvedAmount = null) => {
  if (!item) return item;

  console.log(`🔄 Syncing amounts for ${item.category} (status: ${item.itemStatus})`);

  if (item.itemStatus === 'approved') {
    // For approved items: ALL fields should be the same (approved amount)
    const amount = approvedAmount !== null ? approvedAmount : (item.approvedAmount || item.actualAmount || item.budgetAmount || 0);
    item.amount = amount;
    item.actualAmount = amount;
    item.budgetAmount = amount;
    item.approvedAmount = amount;

  } else if (item.itemStatus === 'rejected') {
    // For rejected items: ALL fields should be 0
    item.amount = 0;
    item.actualAmount = 0;
    item.budgetAmount = 0;
    item.approvedAmount = 0;

  } else {
    // For pending items: amount = actualAmount = budgetAmount, approvedAmount = 0
    const amount = item.actualAmount || item.budgetAmount || item.amount || 0;
    item.amount = amount;
    item.actualAmount = amount;
    item.budgetAmount = amount;
    item.approvedAmount = 0;

  }

  return item;
};

/**
 * Synchronizes all items in a claim bill and updates totals
 * @param {Object} claimBill - The claim bill to synchronize
 * @returns {Object} - The synchronized claim bill
 */
export const syncClaimBill = (claimBill) => {
  if (!claimBill || !claimBill.expenses) return claimBill;

  // Sync all items
  claimBill.expenses.forEach(item => syncAmountFields(item));

  // Calculate totals based on approved items only
  const approvedItems = claimBill.expenses.filter(item => item.itemStatus === 'approved');
  const totalApprovedAmount = approvedItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);

  claimBill.totalApprovedAmount = totalApprovedAmount;
  claimBill.totalBudgetAmount = totalApprovedAmount;
  claimBill.totalExpenditure = totalApprovedAmount;

  return claimBill;
};

export default { syncAmountFields, syncClaimBill };
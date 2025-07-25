// Main Dashboard Component
export { default as CoordinatorDashboard } from './CoordinatorDashboard';

// Components
export { default as DashboardHeader } from './components/DashboardHeader';
export { default as EventsGrid } from './components/EventsGrid';
export { default as EventFormDialog } from './components/EventFormDialog';
export { default as ClaimBillDialog } from './components/ClaimBillDialog';

// Form Steps
export { default as BasicDetailsStep } from './components/formSteps/BasicDetailsStep';
export { default as CoordinatorsStep } from './components/formSteps/CoordinatorsStep';
export { default as ParticipantsStep } from './components/formSteps/ParticipantsStep';
export { default as RegistrationStep } from './components/formSteps/RegistrationStep';
export { default as FinancialsStep } from './components/formSteps/FinancialsStep';
export { default as ReviewStep } from './components/formSteps/ReviewStep';

// Custom Hooks
export { useEventOperations } from './hooks/useEventOperations';
export { useFormState } from './hooks/useFormState';
export { useClaimOperations } from './hooks/useClaimOperations';
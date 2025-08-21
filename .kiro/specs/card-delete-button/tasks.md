# Implementation Plan

- [x] 1. Add translations for delete functionality
  - Add French and English translations for delete button, confirmation messages, and success/error messages
  - Update the Translations.ts file with new translation keys
  - _Requirements: 2.1, 3.3_

- [x] 2. Create delete confirmation modal component
  - Create DeleteCardModal.tsx component with confirmation dialog
  - Implement modal state management (open/close)
  - Add confirmation and cancel button handlers
  - Style the modal consistently with existing application modals
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Add delete action creator function
  - Create deleteCard action creator function in Actions.ts
  - Ensure it uses the existing CARD_DELETE action type
  - Function should accept a Card object as parameter
  - _Requirements: 1.1, 1.3_

- [x] 4. Implement delete button in Card Layer component
  - Add delete button to the card-submit section in Layer.tsx
  - Implement deleteCard function that opens confirmation modal
  - Add conditional rendering to show button only for existing cards (not new ones)
  - Position button appropriately between Save and Close buttons
  - _Requirements: 1.1, 1.6, 3.1, 3.2_

- [x] 5. Integrate modal with delete functionality
  - Connect confirmation modal to the delete action dispatch
  - Handle modal confirmation to trigger card deletion
  - Handle modal cancellation to close modal without action
  - Ensure proper cleanup of modal state
  - _Requirements: 2.2, 2.3_

- [x] 6. Add success feedback for deletion
  - Update CardDeleteListener to show success message after deletion
  - Ensure the card form closes after successful deletion
  - Add proper error handling for failed deletions
  - _Requirements: 1.4, 1.5_

- [x] 7. Style delete button with destructive appearance
  - Apply appropriate styling to make delete button visually distinct
  - Use destructive color scheme (red/orange) for the button
  - Add hover tooltip explaining the delete action
  - Ensure button placement prevents accidental clicks
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Write unit tests for delete functionality
  - Test delete button visibility logic (shown for existing cards, hidden for new cards)
  - Test modal opening when delete button is clicked
  - Test confirmation and cancellation flows
  - Test action dispatch when deletion is confirmed
  - _Requirements: 1.1, 1.6, 2.1, 2.2, 2.3_

- [x] 9. Integration testing for complete delete flow
  - Test end-to-end deletion flow from button click to success message
  - Test error handling when deletion fails
  - Verify card is properly removed from UI after deletion
  - Test that form closes after successful deletion
  - _Requirements: 1.3, 1.4, 1.5_
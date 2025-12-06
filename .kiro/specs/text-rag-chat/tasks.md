# Implementation Plan

## 1. Backend: Verify and enhance existing RAG infrastructure

- [ ] 1.1 Verify Supabase schema and match_rag_chunks function
  - Confirm rag_documents and rag_chunks tables exist with correct schema
  - Verify match_rag_chunks function returns document_title
  - Create migration script if schema updates needed
  - _Requirements: 5.2, 7.5_

- [ ] 1.2 Add file size validation to document upload
  - Verify 15MB limit is enforced in multer config
  - Add explicit error message for oversized files
  - _Requirements: 2.2_

- [ ]* 1.3 Write property test for unsupported file extension rejection
  - **Property 3: Unsupported file extensions are rejected**
  - **Validates: Requirements 2.3**

- [ ]* 1.4 Write property test for document upload produces chunks with embeddings
  - **Property 4: Document upload produces stored chunks with embeddings**
  - **Validates: Requirements 2.4, 2.5**

## 2. Backend: Enhance RAG chat endpoint

- [ ] 2.1 Verify fallback threshold logic in ragChat.ts
  - Confirm retry with 0.3 threshold when initial search returns empty
  - Add logging for threshold fallback events
  - _Requirements: 5.3_

- [ ]* 2.2 Write property test for RAG fallback threshold
  - **Property 8: RAG fallback threshold on empty results**
  - **Validates: Requirements 5.3**

- [ ]* 2.3 Write property test for RAG query flow
  - **Property 7: RAG query flow produces context-enhanced response**
  - **Validates: Requirements 5.1, 5.2, 5.4**

- [ ]* 2.4 Write property test for RAG response includes source references
  - **Property 10: RAG response includes source references**
  - **Validates: Requirements 7.5**

## 3. Backend: Text generation and provider management

- [ ] 3.1 Verify provider availability endpoint
  - Confirm /api/text/providers returns correct hasCredentials values
  - Verify default model is gpt-4o-mini for OpenAI
  - _Requirements: 1.4, 6.5_

- [ ]* 3.2 Write property test for provider availability
  - **Property 9: Provider availability reflects API key configuration**
  - **Validates: Requirements 6.5**

- [ ]* 3.3 Write property test for text generation returns valid response
  - **Property 1: Text generation returns valid response**
  - **Validates: Requirements 1.1**

## 4. Checkpoint - Backend tests

- [ ] 4. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

## 5. Frontend: RAG toggle and document management UI

- [ ] 5.1 Add RAG toggle component to UI
  - Create toggle switch in top-right area (link icon style)
  - Store RAG mode state in composable or Pinia store
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5.2 Add document upload UI component
  - Create folder icon button in top-right area
  - Implement file picker for .md/.markdown/.txt files
  - Show upload progress and success/error feedback
  - _Requirements: 2.1, 8.4_

- [ ] 5.3 Create documents panel component
  - Display list of uploaded documents
  - Add delete button for each document
  - Show document title and upload date
  - _Requirements: 3.1, 3.2_

## 6. Frontend: Text chat integration

- [ ] 6.1 Create useTextChat composable
  - Implement sendMessage function that calls /api/text/generate or /api/rag/chat based on RAG toggle
  - Handle provider and model selection
  - Manage conversation history
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 6.2 Integrate text chat with Sidebar
  - Add text input for sending messages
  - Display conversation history
  - Show loading state during generation
  - _Requirements: 1.1_

- [ ] 6.3 Display RAG responses with source references
  - Create RAG card component with distinct styling
  - Show referenced document names
  - Differentiate from regular text responses
  - _Requirements: 5.5, 8.1, 8.2_

## 7. Frontend: Error handling and feedback

- [ ] 7.1 Implement error handling for API calls
  - Display user-friendly error messages
  - Maintain conversation state on errors
  - Handle network failures gracefully
  - _Requirements: 1.3, 3.3_

- [ ] 7.2 Add provider selection UI
  - Show available providers from /api/text/providers
  - Allow model selection per provider
  - Persist selection in user preferences
  - _Requirements: 1.2, 6.1-6.4_

## 8. Checkpoint - Frontend integration

- [ ] 8. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

## 9. Integration and cleanup

- [ ] 9.1 Verify end-to-end RAG flow
  - Test document upload → RAG query → response with sources
  - Verify toggle switches between RAG and regular chat
  - _Requirements: All_

- [ ]* 9.2 Write property test for document list reflects stored documents
  - **Property 5: Document list reflects stored documents**
  - **Validates: Requirements 3.1**

- [ ]* 9.3 Write property test for document deletion removes all related data
  - **Property 6: Document deletion removes all related data**
  - **Validates: Requirements 3.2**

- [ ]* 9.4 Write property test for Markdown chunking round-trip
  - **Property 11: Markdown chunking round-trip preserves content**
  - **Validates: Requirements 2.4**

## 10. Final Checkpoint

- [ ] 10. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

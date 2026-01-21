# Testing Guide for RSTU Connect

This document describes the testing infrastructure and TDD workflow for developing RSTU Connect, particularly when working with Claude Code.

## Test Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing
- **Playwright** - E2E testing (runs in CI)

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- "profileStorage"

# Run with coverage
npm test -- --coverage

# Run in watch mode (for TDD)
npm test -- --watch

# Run E2E tests (requires build first)
npm run build
npx playwright test
```

## Test Structure

```
├── __tests__/                    # Root-level tests
│   ├── authService.test.ts       # Auth service tests
│   └── smoke.test.ts             # Basic smoke tests
├── src/
│   ├── lib/__tests__/            # Storage/utility tests
│   │   ├── profileStorage.test.ts
│   │   ├── governanceStorage.test.ts
│   │   ├── electionStorage.test.ts
│   │   ├── delegateStorage.test.ts
│   │   └── canvassStorage.test.ts
│   └── components/
│       ├── __tests__/            # Component tests
│       │   └── BuildingList.test.tsx
│       ├── Elections/__tests__/
│       │   └── RankedChoiceVoting.test.tsx
│       └── Profile/__tests__/
│           └── DelegateStatusCard.test.tsx
└── e2e/                          # Playwright E2E tests
    └── smoke.spec.ts
```

## Writing Tests with Claude Code

### TDD Workflow

1. **Describe the feature** - Tell Claude what you want to test
2. **Claude writes tests first** - Tests define expected behavior
3. **Run tests (expect failures)** - Verify tests are checking the right things
4. **Claude implements feature** - Write code to make tests pass
5. **Run tests (expect passes)** - Verify implementation
6. **Refactor if needed** - Tests catch regressions

### Example Prompts

**For storage/lib functions:**
```
Write tests for the calculateDelegateWeight function in delegateStorage.ts.
It should test:
- Weight calculation with different tenant counts
- Activity bonus application
- Max weight cap at 100
- Edge cases (0 tenants, negative values)
```

**For components:**
```
Write tests for the DelegateStatusCard component. Test:
- Rendering qualified vs in-progress status
- Progress bar values
- Activity breakdown display
- Network stats visibility
```

### Mock Patterns

#### Mocking localStorage

Storage functions use `safeStorage` which wraps localStorage. Tests mock at the function level:

```typescript
// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear()
})
```

#### Mocking React Context

```typescript
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,  // Returns translation key as-is
    locale: 'en',
    setLocale: jest.fn(),
  }),
}))
```

#### Mocking Storage Functions

```typescript
const mockGetCurrentDelegateProfile = jest.fn()

jest.mock('@/lib/delegateStorage', () => ({
  getCurrentDelegateProfile: () => mockGetCurrentDelegateProfile(),
}))

beforeEach(() => {
  mockGetCurrentDelegateProfile.mockReturnValue({
    profileId: 'user-1',
    verifiedTenantsRepresented: 25,
    // ...
  })
})
```

#### Mocking fetch

```typescript
const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ p: [], c: 0 }),
  })
)
global.fetch = mockFetch as unknown as typeof fetch
```

#### Stable Mock References (Important!)

When mocking functions that return arrays/objects, use stable references to prevent infinite re-renders:

```typescript
// BAD - creates new array each call, causes infinite loops
jest.mock('@/lib/storage', () => ({
  getItems: jest.fn(() => []),  // New array each time!
}))

// GOOD - stable reference
const mockItems: Item[] = []
jest.mock('@/lib/storage', () => ({
  getItems: jest.fn(() => mockItems),
}))
```

### Component Test Patterns

#### Waiting for Async Loading

```typescript
it('renders after loading', async () => {
  render(<MyComponent />)

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Expected Content')).toBeInTheDocument()
  })
})
```

#### Testing User Interactions

```typescript
it('handles click', async () => {
  const user = userEvent.setup()
  const mockHandler = jest.fn()

  render(<Button onClick={mockHandler}>Click me</Button>)

  await user.click(screen.getByText('Click me'))

  expect(mockHandler).toHaveBeenCalled()
})
```

#### Finding Elements with Translation Keys

When using mocked translations that return keys:

```typescript
// Translation mock returns key, so search for the key
expect(screen.getByText('buildings.units')).toBeInTheDocument()

// Or use regex for partial matches
expect(screen.getByText(/50 buildings\.units/)).toBeInTheDocument()
```

## Test Categories

### Unit Tests (Storage Functions)

Test pure logic without React:
- Input/output validation
- Edge cases
- Error handling
- State mutations

**Example:** `governanceStorage.test.ts` - 67 tests for voting logic, thresholds, Bookchin principle

### Component Tests

Test React components with mocked dependencies:
- Rendering states (loading, error, success)
- User interactions
- Props handling
- Conditional display

**Example:** `BuildingList.test.tsx` - 14 tests for search, filter, selection

### Integration Tests

Test multiple modules working together:
- Auth flow with profile storage
- Voting with delegate verification

**Example:** `authService.test.ts` - Tests auth + profile + Supabase integration

### E2E Tests (Playwright)

Test full user flows in browser:
- Page navigation
- Form submissions
- Cross-page state

**Example:** `e2e/smoke.spec.ts` - 9 tests for critical paths

## Current Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| profileStorage | 53 | Auth, roles, permissions, invites |
| governanceStorage | 67 | Voting, thresholds, proposals |
| canvassStorage | 80 | Units, habitability, contacts |
| electionStorage | 22 | Elections, nominations, RCV |
| delegateStorage | 15 | Weight calculation, qualification |
| authService | 20 | Auth flows, Supabase sync |
| BuildingList | 14 | Search, filter, selection |
| RankedChoiceVoting | 14 | Drag/drop, vote submission |
| DelegateStatusCard | 12 | Progress display, stats |
| E2E smoke | 9 | Critical user paths |

**Total: 311+ tests**

## CI/CD Integration

Tests run automatically on push to main:

```yaml
# .github/workflows/deploy.yml
- name: Run tests
  run: npm test -- --coverage --passWithNoTests

- name: Run Playwright tests
  run: npx playwright test
```

Build fails if tests fail, preventing broken deployments.

## Tips for Claude Code

1. **Ask for tests first** - "Write tests for X, then implement it"
2. **Be specific about edge cases** - "Test with 0, negative, and very large values"
3. **Request mock patterns** - "Show me how to mock the storage functions"
4. **Run tests frequently** - After each change, verify tests still pass
5. **Check coverage** - "What's the test coverage for this module?"

## Adding New Tests

1. Create test file in appropriate `__tests__/` directory
2. Import dependencies and set up mocks
3. Write `describe` block for the module/component
4. Add `it` blocks for each behavior
5. Run `npm test -- "filename"` to verify
6. Commit with descriptive message

---

*Last updated: 2026-01-21*

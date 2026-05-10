# Test Cases for Manager & Project Assignment

## TL (Team Lead) Tests

### Create TL Scenarios

**Test 1: Create TL without project assignment**
1. Open TL Dialog in create mode
2. Fill all required fields (name, email, password)
3. Leave "Assign Projects" empty
4. Select a PM in "Report To"
5. Save
6. **Verify:** 
   - TL created successfully
   - `User.managerId` contains the selected PM ID
   - No `ProjectMember` records created

**Test 2: Create TL with single project**
1. Open TL Dialog in create mode
2. Fill all required fields
3. Select one project in "Assign Projects"
4. **Verify:** PM auto-selected in "Report To" (from project members)
5. Save
6. **Verify:**
   - TL created successfully
   - `User.managerId` is null
   - `ProjectMember` record created with `managerId` = selected PM

**Test 3: Create TL with multiple projects**
1. Open TL Dialog in create mode
2. Fill all required fields
3. Select multiple projects (e.g., Project A with PM Alice, Project B with PM Bob)
4. **Verify:** Both PMs auto-selected in "Report To"
5. Save
6. **Verify:**
   - TL created successfully
   - Two `ProjectMember` records created
   - Each has correct `managerId` (Alice for Project A, Bob for Project B)

### Update TL Scenarios

**Test 4: Update TL - Add project to existing (no projects)**
1. Edit TL that has no projects assigned
2. Add a project
3. **Verify:** PM auto-selected
4. Save
5. **Verify:** `ProjectMember` created with correct `managerId`

**Test 5: Update TL - Add more projects to existing**
1. Edit TL with Project A assigned (PM Alice)
2. Add Project B (PM Bob)
3. **Verify:** Both Alice and Bob selected in "Report To"
4. Save
5. **Verify:** Both project assignments preserved with correct managers

**Test 6: Update TL - Remove all projects**
1. Edit TL with projects assigned
2. Remove all projects
3. Select a PM in "Report To"
4. Save
5. **Verify:**
   - All `ProjectMember` records deleted
   - `User.managerId` updated with selected PM

**Test 7: Update TL - Remove one project, keep others**
1. Edit TL with Project A and Project B
2. Remove Project A
3. **Verify:** Only Project B's PM remains selected
4. Save
5. **Verify:** Only Project B's `ProjectMember` remains

## TM (Team Member) Tests

### Create TM Scenarios

**Test 8: Create TM without project**
1. Open TM Dialog in create mode
2. Fill required fields
3. Leave "Assign Projects" empty
4. Select a TL in "Report To"
5. Save
6. **Verify:** `User.managerId` contains TL ID, no `ProjectMember` records

**Test 9: Create TM with single project**
1. Open TM Dialog in create mode
2. Fill required fields
3. Select one project
4. **Verify:** TL auto-selected from project members
5. Save
6. **Verify:** `ProjectMember` created with correct `managerId`

**Test 10: Create TM with multiple projects (same TL)**
1. Select multiple projects with same TL
2. **Verify:** TL auto-selected (no duplicates)
3. Save
4. **Verify:** All projects assigned with same TL

**Test 11: Create TM with multiple projects (different TLs)**
1. Select Project A (TL Alice) and Project B (TL Bob)
2. **Verify:** Both TLs selected
3. Save
4. **Verify:** Each project has correct TL as manager

### Update TM Scenarios

**Test 12: Update TM - Switch from no projects to projects**
1. Edit TM with no projects
2. Add projects
3. **Verify:** TLs auto-selected
4. Save
5. **Verify:** `ProjectMember` records created

**Test 13: Update TM - Change projects**
1. Edit TM with Project A
2. Change to Project B
3. **Verify:** Manager updates to Project B's TL
4. Save
5. **Verify:** Old assignment removed, new one created

## Cross-Connectivity Tests

**Test 14: TM with multiple TLs across projects**
1. Create TM assigned to Project A (TL Alice) and Project B (TL Bob)
2. **Verify:** Both TLs stored in respective `ProjectMember` records
3. Check UI: In Project A details, shows Alice as manager
4. Check UI: In Project B details, shows Bob as manager

**Test 15: TL with multiple PMs across projects**
1. Create TL assigned to Project A (PM X) and Project B (PM Y)
2. **Verify:** Both PMs stored correctly
3. Check UI: Each project shows correct PM as manager

## Edge Cases

**Test 16: Project with no PM/TL assigned**
1. Select a project that has no PM/TL in members
2. **Verify:** No manager auto-selected
3. User must manually select manager
4. Save
5. **Verify:** Still works with manually selected manager

**Test 17: Remove manager when projects assigned**
1. Edit user with projects assigned
2. Manually remove all managers from "Report To"
3. Save
4. **Verify:** `ProjectMember` records created with `managerId: null`

**Test 18: Create with invalid manager ID**
1. Try to set manager that doesn't exist in projectManagers list
2. **Verify:** Form validation prevents submission

**Test 19: Same user as manager**
1. Try to assign user as their own manager
2. **Verify:** Error "User cannot be their own manager"

**Test 20: Duplicate project selection**
1. Try to select same project multiple times
2. **Verify:** MultiSelect prevents duplicates

**Test 21: Switch from project-based to user-based manager**
1. Edit user with projects assigned
2. Remove all projects
3. Select manager in "Report To"
4. Save
5. **Verify:** Manager moved from `ProjectMember` to `User.managerId`

**Test 22: Skills field validation**
1. Enter skills with special characters
2. **Verify:** Skills saved correctly as array
3. On edit, skills displayed as comma-separated string

**Test 23: Email uniqueness**
1. Create user with existing email
2. **Verify:** Error "Email already registered"

**Test 24: Password validation**
1. Enter password < 6 characters
2. **Verify:** Validation error

**Test 25: Phone number validation**
1. Enter non-numeric characters in phone
2. **Verify:** Characters rejected or stripped

**Test 26: Update without changing manager**
1. Edit user, change only name
2. Save
3. **Verify:** Manager assignments unchanged

**Test 27: Concurrent project assignment**
1. User A assigned to Project X
2. User B also assigned to Project X
3. **Verify:** Both have correct project-specific managers

**Test 28: User deletion**
1. Delete user with project assignments
2. **Verify:** Associated `ProjectMember` records also deleted (cascade)

**Test 29: Project deletion**
1. Delete project
2. **Verify:** Associated `ProjectMember` records removed
3. Users still exist but project assignment removed

**Test 30: Empty form submission**
1. Submit form without required fields
2. **Verify:** Validation errors displayed for all required fields
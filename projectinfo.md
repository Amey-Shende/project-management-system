Below is a **clear, production-ready spec** for what a **CEO** can do in each module and **exactly which fields** you should expose for **listing, add, update, and detail pages**. This is aligned with your RBAC + hierarchy and avoids over-nesting while keeping full visibility.

---

# 🔷 1) Projects (CEO = full control)

## ✅ Actions

* Create, Read, Update, Delete
* Assign / change **PM**, **TL**, **Team Members**
* Change status (Active / Completed)
* View analytics (counts, trends)

## 📋 Listing (table)

![Image](https://images.openai.com/static-rsc-4/T0sFqiucWolILwubcuwWDFxwduGuIN2degDKI2xEsJJDLK_6J4RwEqRd2khRm_NVVEqOHu_qw9N-FJiDa6uOczIW3Pqb6rNGfFR5bZo6pJbOdNk46VYMM6Lq1494pCDCBAI06sxYvSHVvXXAUSSJIj2t4auomscxZsujxGDK2NMRvK_QNAUp0Jotho7So6yD?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/T_bO1gDWa8oM7K874cmg6M5OicdiOkIvcE6FgjhJMpFsT8_55qK22XmGqa5x7E_H79geke5vlW-i-AE5Eiwk0oqXye-alaSx-6evru6Ym2cM6rSWFKgQxG6ze1Oi9MfIcdlnem0Wp14cBzTWv30y_rvnX3DQ6cKdADnSj5YdDJVei6X_1hEwNv87KPWzyzkO?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/_sWN2y0scQ8hikUUrq_8q-2hX2xqK7wvpaMX5ewyS2dvBGnp6VQtmqu8vrKAsB-i47v4RopEghfXgp5e4AQ8ViyRNNlfi59XX-dEVi2fPuDWVge3g2omr3qOVQGRIMcCbs6Qd1LmVDHP46vpb9VG6tzpUh8nfvENPXekyH9V50cVqkl2c-5s6IES4du2dtit?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/mbPXZT05vWe1avDQi0Ab-9itX5GmxbzTLzvODZMC3V050oHEHdHtaXvYBdlXiZo49vWblKHqQ4hDkA95IfvgSvBgAyyjklpiUoQ-Z7ZksHbOOgpE4u7oVtOh5zPPOmO1AaswnufqUrVMyvCV_SAlyEsUjxREbSaU3NUwYrdTBvzhckiGexPF5IhnpwmTP4jj?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/Td612zv1c1ca6l-7gGlBldww0wtehZVQtAnqD0Mi-8Ld2REzLpjg7gtHJT0HsRRyYpsPlzxeC-nZkq0V9SSpE3c72EwW0KpZnvVV66-OuwXYeUD0wkEc5WsySjoXRVyzly2cx5DxuxzLRE8nq91h7Bt4_ekpj2837vBbUT5TlWUDxiJRybJvMJA2q6Kcm7Ih?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/C6vGt9hhKx5W8buMTNGOO0dHbFfwbYON_oTT2qq8Avl-jEL0SIg0ZRscxaPIAPXddGEg0l3uE2sWz95RjFZKK3ZUk63EqKblk_Xy7N91d33w7I41vCrVqmx1mAe_azr92M7kVQk2xMuzJ9i2K0QpyYIySFeLb2RRXGUjuMasngDuBFiRX0yWcyh0xAPgIFTZ?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/XcUee8t2OkJG4acETa1dv4Re8bxBj9N1nEU8_V7mG6yRGx201h6Ey-iIkVrKQ5JwbhnMuo-CyPnGMOJatwa8xuW-EH08BlIgtBMMFEYpV9C8W_XHW-nNZaKFoNYsV0_xhYwnbNP1fW4rp3Dex-j-kCOWuDumBSX9tij3lUCSnJThlisqb8hjwrSMyvvfp462?purpose=fullsize)

**Columns**

* Project Name
* Status (badge)
* Project Manager (PM)
* Team Lead (TL)
* Members Count
* Start Date
* End Date
* Last Updated

**Controls**

* Search, filters (Status, PM), sort, pagination

---

## ➕ Add Project (form fields)

```text
Project Name *
Description
Project Manager (PM) *
Team Lead (TL) *
Team Members (multi-select; default = TL’s team, allow override with warning)
Start Date
End Date
Status (Active/Completed)
```

---

## ✏️ Update Project

* All fields editable
* Allow reassignment (PM/TL/TMs)
* Show confirmation if hierarchy changes (e.g., TL change)

---

## 🔍 Project Detail Page

* Header: Name, Status, Dates
* Stats: Members count, completion %
* Sections:

  * PM (card)
  * TL (card)
  * Team Members (table)
  * Activity (optional: changes/audit)
* Quick actions: Edit, Change status

---

# 🔷 2) Team Members (TM)

## ✅ Actions

* Create, Read, Update, Delete
* Assign to **Team Lead** (managerId)
* Assign to **Projects** (multi-select)

## 📋 Listing

**Columns**

* Name
* Email
* Role (TM)
* Team Lead (Manager)
* Assigned Projects (count)
* Status (Active/Inactive)
* Created Date

---

## ➕ Add TM

```text
Name *
Email *
Password (optional if TM cannot login)
Team Lead (TL) *
Assign Projects (optional; can add later)
Status (Active/Inactive)
```

---

## ✏️ Update TM

* Change TL (managerId)
* Add/remove project assignments
* Toggle status

---

## 🔍 TM Detail

* Basic info (name, email, status)
* Manager (TL)
* Projects (list)
* Activity (optional)

---

# 🔷 3) Team Leads (TL)

## ✅ Actions

* Create, Read, Update, Delete
* Assign to **Project Manager (PM)**
* Manage their **Team Members** (indirect)

## 📋 Listing

![Image](https://images.openai.com/static-rsc-4/fEQtYLCItkSMCYEALPt0KHS0d8SjnVSTE6Cuuv7EPal0HEwjdXQfLgU3b5dQwNvp87HV1ruYtnHpxi7DM3Lvoyq3hawFrk4BZMOGqYR9WOIrSHqxYPCDxl79WMwUmUPVe11UBunM5pQ4i5Xu9RLUIeaPhU0TeN34NaAFveltafZbYGj9b-tkGguelF5A89nz?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/b0IOaj8y5JXPkLXW8zqRMXwDfgC8KVIajs2dmBFAQR40wkyyF2BBrrEKWX5H7bHcyK0em-lWaPsNOGFiwvE8MFQdTWWHsNOuz5tmdt1WFZCckQx-8NzrDeCDb1z6c4Jt_-weujxAnkpWgh9F_CkFuK_dbA3whfNvIfAWFAvKZoH1UPg6D4P5WYVi7NNqV-TW?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/cOjNlMkxZlE_F56tCx0GP8mjgG0Rq8iX9qIROKACqmNjbJcPtoydvnbINYMKFX9ZeAHMcj0QBfyNQtLjmxF7yodzde9ytdwxhy5lHCueaqxUUzpSZOL0dlSaVUtKe2kxbAsnbrvdjmuyldIftkbbPqJhKMIKBVm_3ZHcgxmF15GKgXuDvfpkc2-XeyI5Wq4Q?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/_5EHngbN5yE3dSLLaA_ar2V95eAUl4x1Ll0udACZ_6qgNMBuZyRAi6OU-1qhw1RFgiB_ghbbGIoFEVIchhdrHHhTg3ynzBAEcfSkHqhlGF72gR3XsgseNKMolJyEDMm-Sejq_UuCPWfYdbxdnXPca42sn2bsVABUzR980SApxaHeWPZwz8aahYWhK60S6fxW?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/W0Lp9-KlMxHa7jZV_2ABz2tCbBADsYZdSyuOkihVu7NR5UVBZekC76xWphJ8_ooTOMMu4vGt18BdKonT6C1aCi65UVxYNfehOqqx6BO1ckZTbMk53yPD5YxNlrNQRn5CxtYgyjUMFJLyiPFyG3_jNIctBACouN2r54j6zKL-rKNAFy4b39e5e5HStyLPnv9y?purpose=fullsize)

**Columns**

* Name
* Email
* Assigned PM
* Team Members Count
* Projects Count
* Status
* Created Date

---

## ➕ Add TL

```text
Name *
Email *
Password *
Assign Project Manager (PM) *
Status
```

---

## ✏️ Update TL

* Change PM
* Reassign team members if needed
* Toggle status

---

## 🔍 TL Detail

* Basic info
* PM info
* Team Members (table)
* Projects (table)

---

# 🔷 4) Project Managers (PM)

## ✅ Actions

* Create, Read, Update, Delete
* Assign TLs
* Configure permissions (if you enabled RBAC overrides)

## 📋 Listing

![Image](https://images.openai.com/static-rsc-4/FWmvgQPYubxod7zP4dLmYEsIC_AUAoXNK6X9F0Atgj1J47SRPGmG069n_8UtzpJ686kXgvWj6uE4TuRmoyx9IBuPiW7oVNCfJF2Dpe2MedBF3xY6bJlJ_m3Yn5RKoUWL0Ly5JsNvmbxUTjPSC8Nm1KzvDueobhl2UuT-w2JtKbUEeaAh-7mrfbnHKs_B7A5d?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/tpcdPBvDU9lg7Q7QOwpqGaCGbEi9oWPwwRg3eE6otF6fGN1OsAErk2ex-mtPAdvmWqg2fFak1uWYxJ6UBhMKNCuI1D5bGvViDbGaE4aW6HOr3Lv7RmErc-6xA2SRg9vxMT0oGbSXwdn6-8S5ccmEWkMuG66UR3T_12gMBRMFw2_y8c0FwlxzXla3EtXHegJ3?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/eN2UaAMewzAi60u5kmiirvF0mlnMAbEZYJ7nlJBhcQe_Hox0Jb-0gq1qjQb_L8oJqiyS2See4Dj1gHhvafxglBQPtF31-lt6_9qAVdEflEbFHl1eg1ZSzfaQ_lxIiVdrW4K80e6D4Pch0MUI_o9_klN2xAZmdUUGJIcPCpJRLGAIoDrS5WuGJPn7mPyb2i2C?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/imXqr62MenaJBfPvzI1Op42vI9ayGYK-yK3OxMuUyI_Kwp8dnz7LRX_zt-5BdhqvLtcNwlSfQA9X92iI7agdIuNVWLK_ImmBBllsev2rI4H-OVavE81Z1c2Dt-lLwaCU2MBWtxEABWVDkFwl1cRyklFb-7GhnfoHLrxFyGEgj3ISvlHjYf7QlT2J3MCXpowM?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/p84FqE5Be6HLyH_ljoCQaUkHsTaz9fN9_mDIe2rqmlrR14ESmCh-Se9qrk6vPrGWh5J7SQkvokCXtiuCA3BRPCq7ZFuIF2MHNWTrufM4zmt42rr9YOHlSlw8RsvZ0s5Stic6SWEPcWNtKRMGVuOWepAZGxLO3xVQS_flrrDeYKs1Zlev4aPnVx5e6EzkIUrf?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/L69BQWzkkPjMEU7aH27Oti48uLzBX5FxkUcYtrAvoTKQrYbh_IEYriuhCqbg1wBu99WzuwdFjfV5ghikIxhT4apHUEIJa892qFyQEqNBvx1ujF_tQJrY0c3eUWE039aYVs2CWh4zo3rZKv5VDdSX5uMoXygnmi-QhleI8UK7IXJ-0U20v7RecuGComzqtqF-?purpose=fullsize)

**Columns**

* Name
* Email
* Team Leads Count
* Projects Count
* Active Projects
* Completed Projects
* Status

---

## ➕ Add PM

```text
Name *
Email *
Password *
Status
```

---

## ✏️ Update PM

* Basic info
* Assign/remove TLs
* (Optional) Manage permissions

---

## 🔍 PM Detail

* Stats:

  * Total / Active / Completed Projects
* Sections:

  * Projects (table)
  * Team Leads (table)
  * Team Members (derived, optional)
* Actions:

  * Edit
  * Manage Access (if applicable)

---

# 🔷 Cross-Cutting UX Rules (Important)

### ✅ 1. Consistent Tables

* Same patterns: search, filter, sort, pagination

### ✅ 2. Progressive Disclosure

* Show summary → expand to details
* Avoid deep navigation chains

### ✅ 3. Smart Defaults

* When TL selected → preload their team members
* When project selected → prioritize relevant TLs/TMs

### ✅ 4. Validation (Backend-first)

* Ensure TM belongs to TL (or handle override + auto-link)
* Ensure TL belongs to PM (or confirm reassignment)

### ✅ 5. Status Handling

* Use soft delete via `isActive`
* Don’t hard-delete users linked to projects

---

# 🔷 Minimal Field Checklist (Quick Copy)

```text
Project:
- name, description, pmId, tlId, members[], status, startDate, endDate

User (PM/TL/TM):
- name, email, role, managerId, status
```

---

# 🔷 One-Line Summary

> CEO gets **full CRUD + full visibility**, but the UI should emphasize **overview, structure, and controlled reassignment**, not deep nested navigation.

---

If you want, next I can:

* Build **React + Tailwind (shadcn) pages for each module**
* Give **API routes + Prisma queries for all screens**
* Add **permission checks middleware**

Just say 👉 *“build UI code for one section”*


# Meowshunt Technical Design Document

## 1. Tech Stack

- **Frontend**: Next.js (React framework)  
- **UI**: shadcn/ui (modular, accessible components with TailwindCSS)  
- **Backend**: Supabase (Postgres DB, authentication, API)  
- **Hosting**: Vercel (frontend + API routes)  
- **Admin Platform**: Next.js + Supabase (separate role-based dashboard)  

---

## 2. Database Schema

### Users
| Field             | Type        | Notes |
|-------------------|------------|-------|
| id                | UUID (PK)  | Supabase auto-generated |
| username          | Text       | Unique player name |
| email             | Text       | Unique, for login |
| password_hash     | Text       | Auth handled by Supabase |
| exp               | Integer    | Experience points |
| rank              | Text       | Derived from exp milestones |
| energy            | Integer    | Current energy level |
| energy_max        | Integer    | Default 15, can increase with special items |
| gold              | Integer    | Player’s soft currency |
| created_at        | Timestamp  | |

---

### Traps
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | Flavor text |
| price         | Integer   | Purchase cost |
| power         | Integer   | Trap strength |
| type          | Text      | E.g., mechanical, magical |
| available_at  | UUID[]    | Locations where available (join table recommended) |

---

### Rugs
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | Flavor text |
| price         | Integer   | |
| attraction    | Integer   | Boost to bait effectiveness |
| available_at  | UUID[]    | Locations where available (join table recommended) |

---

### Baits
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | |
| price         | Integer   | |
| attraction    | Integer   | Determines how strongly Meows are drawn |
| available_at  | UUID[]    | Locations where available (join table recommended) |

---

### Locations
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | |
| difficulty    | Integer   | Difficulty tier |

---

### Meows
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | Lore/flavor text |
| hidden_power  | IntRange  | **Hidden from players**. Determines catch difficulty vs trap power (RNG-based). |
| reward_gold   | Integer   | |
| reward_exp    | Integer   | |
| found_at      | UUID[]    | Locations where Meow can appear (join table recommended) |

---

### Items (Generic Table for Future Expansion)
| Field         | Type       | Notes |
|---------------|-----------|-------|
| id            | UUID (PK) | |
| name          | Text      | |
| description   | Text      | |
| type          | Text      | trap / rug / bait / cosmetic / misc |
| price         | Integer   | |
| metadata      | JSONB     | Flexible field for future extensions |

---

### Join Tables
To manage **availability and spawns**:  
- `trap_location (trap_id, location_id)`  
- `rug_location (rug_id, location_id)`  
- `bait_location (bait_id, location_id)`  
- `meow_location (meow_id, location_id)`  

---

## 3. Authentication & Account Management
- Supabase Auth with email/password (option for OAuth later).  
- JWT sessions for web app.  
- Role-based access: `player`, `admin`.  
- Admin panel uses the same system but restricted routes.  

---

## 4. Gameplay Logic (Catch Rate System)

1. Player equips Trap + Rug + Bait.  
2. Player hunts, consuming **1 energy**.  
3. System determines outcome:  
   - **Trap Power vs Meow Hidden Power Range**  
   - Random roll within Meow’s hidden power range.  
   - If Trap Power ≥ roll → **Catch Success**.  
   - Else → **Miss**.  

This ensures RNG fairness while still rewarding progression.  

---

## 5. UI / UX Design System

### Navigation Pages
- **Camp (Home)** → Show energy, equipped trap/rug/bait, hunt button.  
- **Shop** → Buy traps, rugs, baits, items.  
- **Inventory** → Manage equipment and consumables.  
- **Locations Map** → Unlock new hunting grounds.  
- **Collections** → View caught Meows.  
- **Admin Dashboard** → Add/edit items, traps, rugs, baits, locations, meows.  

### UX Considerations
- **Mobile-first** design.  
- **One-hand navigation** (bottom nav bar).  
- **Accessibility**:  
  - High contrast mode  
  - Scalable text  
  - Alt-text for all images  

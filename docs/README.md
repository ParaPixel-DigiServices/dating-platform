# Amora Documentation

> **⚠️ IMPORTANT NOTICE FOR DEVELOPERS:**
> 
> The documents in this folder (`DATA_MODELS_V2`, `schema_v4`, `schema_v5`, etc.) are **historical architectural proposals and iterations**. They do not accurately reflect the current live state of the application. 
> 
> Many of the features discussed here (like AI Insight Reports, Sync Reports) were proposed for future versions but are not part of the current MVP.
> 
> ### Where is the Source of Truth?
> 
> 1. **Database Schema**: The absolute source of truth for all data models is the Prisma schema located at:
>    👉 `apps/backend/prisma/schema.prisma`
> 
> 2. **Project Setup & Architecture**: Please refer to the main `README.md` at the very root of this repository (`/README.md`) for the most up-to-date information on the tech stack, features implemented, and how to run the project.

---

### What's actually in use right now (MVP):
- **Love Category**: Uses `SparkQuestions` and `SparkAnswers`.
- **Marriage Category**: Uses `MarriageProfile` with `PartnerPreference` and `FamilyBackground`.
- **Core Models**: `User`, `Profile`, `Photo`, `Match`, `Chat`, `Message`.

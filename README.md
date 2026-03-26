# Outlinr

Outlinr is a modern, secure platform offering comprehensive **Escrow Services** to facilitate trust and seamless communication between buyers, sellers, and agents. Built with a robust Spring Boot backend and a highly responsive React frontend, Outlinr integrates native payment processing via Interswitch and automated email flows via Resend.

## Test Credentials
#### Web Checkout
```
Card Number: 5061040000000000306
Expiry Date: Any future date (e.g., 12/27)
CVV: 123
PIN: 1234
OTP: 123456
```
#### BVN
22222222222 (preferred)

#### NIN
12345678901

#### Bank Account
1234567890 (GTB)

## Contribution:
Hilary Onianwa: Frontend
David Bakare: Backend

## 🚀 About the Project

Outlinr is designed to bridge the gap of trust in online transactions. By acting as a secure intermediary, our Escrow system ensures that funds are only released when both parties are satisfied. 
Coupled with a modern user interface, users can easily navigate their transactions, get instant support, and manage their escrow agreements efficiently.

### Key Features
- **Secure Escrow Management:** Dedicated flows for Buyers, Sellers, and Agents to create, manage, and finalize escrow agreements.
- **Kyc Compliance & Fraud Prevention:** Real-time identity verification integrated directly into the platform. Powered by BVN and NIN APIs from the **Interswitch API Marketplace**, ensuring instant data validation and secure onboarding.
- **Role-based Email System:** Automated, accessible email invitations and confirmations via Resend for all parties involved in a transaction.
- **Interswitch Payments Integrated:** Secure, cardless, and cross-border payment processing powered by Interswitch APIs.
- **Responsive Modern UI:** Built with React 19 and Tailwind CSS v4 to ensure a pristine user experience across all devices.

---

## Tech Stack

**Frontend (`/app`)**
- React 19 & TypeScript
- Vite (Build Tool & Dev Server)
- Tailwind CSS v4 (Styling)
- Zustand (State Management)
- React Router (Navigation)
- React Icons

**Backend (`/api/v1`)**
- Java 17 & Spring Boot 3
- Spring Security & JWT (Authentication)
- PostgreSQL & Liquibase (Database & Migrations)
- Resend Java SDK (Email Services)

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v20+ recommended) & `pnpm`
- Java 17 & Maven

### 1. Database Setup
Before running the application, you need to set up the database using Docker.

Create the shared Docker network:
```bash
docker network create outlinr_network
```

Run the isolated PostgreSQL database for development:
```bash
docker-compose -f docker/docker-compose.db.yml up -d
```

### 2. Backend Configuration (`/api`)
The API uses two configuration profiles for its database connection:
- `application-dev.yml` (Default): Connects to `localhost:5432` (username/password: `outlinr`).
- `application-prod.yml`: Uses environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`).

**To run the backend:**
```bash
cd api
./mvnw spring-boot:run
```

### 3. Frontend Configuration (`/app`)
Navigate to the frontend directory, install dependencies, and start the development server.

```bash
cd app
pnpm install
pnpm dev
```
or

```
cd app
npm install
npm run dev
```

---

## Contribution Guidelines
When making changes, please ensure:
1. **Frontend:** Run `pnpm lint` and ensure type-safety. Keep the UI fully responsive.
2. **Backend:** Ensure the database schema matches JPA models and that you handle `@Transactional` contexts correctly.
3. **Database:** Create corresponding Liquibase changelogs for any new entities.

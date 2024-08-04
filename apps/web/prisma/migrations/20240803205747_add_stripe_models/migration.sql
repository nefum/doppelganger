-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_supabaseUserId_key" ON "stripe_customers"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripeCustomerId_key" ON "stripe_customers"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "stripe_customers"("stripeCustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

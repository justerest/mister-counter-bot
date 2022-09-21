-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "username" TEXT
);

-- CreateTable
CREATE TABLE "StringAddress" (
    "value" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "StringAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StringAddress_userId_key" ON "StringAddress"("userId");

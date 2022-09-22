-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "username" TEXT,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL,
    "value" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "WaterLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

/*
  Warnings:

  - A unique constraint covering the columns `[userId,clientDeviceId]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientDeviceId` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "clientDeviceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_clientDeviceId_key" ON "Device"("userId", "clientDeviceId");

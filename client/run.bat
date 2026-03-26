@echo off
cd "d:\MERN Stack\mini project\client"
npm run lint > lint_log.txt 2>&1
echo Done >> lint_log.txt

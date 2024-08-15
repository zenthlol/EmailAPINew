// fileDeletionTask.js
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Directory you want to clean
const folderPath = './uploads';


function deleteFilesInFolder(folder) {
  fs.readdir(folder, (err, files) => {
    if (err) {
      console.error('Unable to scan folder:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folder, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Unable to get file stats:', err);
          return;
        }

        const now = new Date().getTime();

        // Deleting files older than ....
        // const endTime = new Date(stats.mtime).getTime() + 24 * 60 * 60 * 1000; // 1 day
        const endTime = new Date(stats.mtime).getTime() + 60 * 60 * 1000; // 1 hour

        if (now > endTime) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('Deleted file:', filePath);
            }
          });
        }
      });
    });po
  });
}

function scheduleFileDeletion() {
  // Schedule a task to run at a specific interval
  cron.schedule('0 22 * * *', () => { // task runs every midnight 10 PM
    console.log('Running file deletion task');
    deleteFilesInFolder(folderPath);
  });
  
  console.log('Cron job started: Deleting files older than 1 day every 10 PM');
}

module.exports = scheduleFileDeletion;

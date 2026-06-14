        // Settings: Storage Access Framework export / import simulated routines
        function triggerSAFBackup(type) {
            if (type === 'export') {
                alert("Database backup export triggered successfully via SAF.\nFile saved to selected download directory: currtra_backup.db");
            } else {
                alert("Restoring database from SAF. Select a valid currtra_backup.db backup file.\nPragma check passes. Database reloaded successfully.");
            }
        }


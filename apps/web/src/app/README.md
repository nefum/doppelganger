You may notice that there is only one error.tsx file in this project, with the rest of the error files being symlinked to it. The reason for this is simple: it allows me to provide error boundaries while still having a consistent style and functionality on error pages. I do not use the error pages for anything other than a possible server-side error, so this is suitable for this app.

Currently, however, these symlinks are not present. These symlinks are prone to breaking for some reason and then they cause `next build` to hang forever. No error code! Yippee!

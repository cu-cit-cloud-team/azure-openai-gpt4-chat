import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ArrowUpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import pkg from '../../package.json';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

export const UpdateCheck = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const compareVersions = (v1: string, v2: string): number => {
      // Remove 'v' prefix if present
      const clean1 = v1.replace(/^v/, '');
      const clean2 = v2.replace(/^v/, '');

      // Split into parts (handle beta, alpha, etc.)
      const parts1 = clean1
        .split(/[-.]/)
        .map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));
      const parts2 = clean2
        .split(/[-.]/)
        .map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));

      // Compare each part
      const maxLength = Math.max(parts1.length, parts2.length);
      for (let i = 0; i < maxLength; i++) {
        const part1 = parts1[i] ?? 0;
        const part2 = parts2[i] ?? 0;

        if (typeof part1 === 'number' && typeof part2 === 'number') {
          if (part1 !== part2) {
            return part1 - part2;
          }
        } else {
          const str1 = String(part1);
          const str2 = String(part2);
          if (str1 !== str2) {
            return str1.localeCompare(str2);
          }
        }
      }
      return 0;
    };

    const getLatestVersion = async (
      org = 'cu-cit-cloud-team',
      repo = 'azure-openai-gpt4-chat'
    ) => {
      try {
        // Use /tags endpoint instead of /releases because /releases only returns
        // tags that have GitHub Releases created, not all git tags
        const response = await fetch(
          `https://api.github.com/repos/${org}/${repo}/tags?per_page=100`
        );

        if (!response.ok) {
          console.error('Failed to fetch tags');
          setUpdateAvailable(false);
          return;
        }

        const tags = await response.json();

        if (!Array.isArray(tags) || tags.length === 0) {
          setUpdateAvailable(false);
          return;
        }

        // Tags are returned in reverse chronological order by default
        // Filter to only version tags (those starting with 'v' followed by a number)
        const versionTags = tags.filter((t) => /^v\d+\.\d+\.\d+/.test(t.name));

        if (versionTags.length === 0) {
          setUpdateAvailable(false);
          return;
        }

        // Sort tags by version number (newest first)
        const sortedTags = versionTags.sort((a, b) =>
          compareVersions(b.name, a.name)
        );

        const latestTag = sortedTags[0];
        const latestVersion = latestTag.name;
        const currentVersion = `v${pkg.version}`;
        const comparison = compareVersions(latestVersion, currentVersion);
        const isNewer = comparison > 0;

        setUpdateAvailable(isNewer);
      } catch (error) {
        console.error('Error checking for updates:', error);
        setUpdateAvailable(false);
      }
    };

    // Check for updates on load
    getLatestVersion();

    // Check for updates every hour
    const updateHandle = setInterval(getLatestVersion, 1000 * 60 * 60);

    // Clear update check interval on unmount
    return () => clearInterval(updateHandle);
  }, []);

  const handleUpdate = () => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Hard reload
    window.location.reload();
  };

  return updateAvailable ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdate}
            className="gap-2 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <ArrowUpCircle className="size-4" />
            Update available
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to reload and get the latest version</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;
};

export default UpdateCheck;

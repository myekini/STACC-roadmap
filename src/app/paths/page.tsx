'use client';

import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/config/roadmapData';

export default function PathSelectionPage() {
  const { selectPath, activePath } = useUserData();
  const router = useRouter();

  const handlePathSelect = (pathId: string) => {
    selectPath(pathId);
    router.push('/roadmap');
  };

  // Helper to get color classes based on path ID
  const getPathCardStyles = (pathId: string, isActive: boolean) => {
    if (isActive) {
      return 'bg-surface-container-low border-2 border-primary shadow-[0_0_20px_rgba(0,74,198,0.15)] dark:bg-primary/10 dark:border-primary-fixed';
    }
    return 'bg-surface border border-outline-variant hover:border-outline hover:shadow-sm dark:bg-inverse-surface/10 dark:border-outline/30 dark:hover:border-outline-variant';
  };

  const getPathIconStyles = (pathId: string) => {
    switch (pathId) {
      case 'data-analysis':
        return 'bg-primary-container text-primary dark:bg-primary/20 dark:text-primary-fixed';
      case 'data-engineering':
        return 'bg-secondary-container text-secondary dark:bg-secondary/20 dark:text-secondary-fixed-dim';
      case 'data-science':
        return 'bg-tertiary-fixed text-tertiary dark:bg-tertiary/20 dark:text-tertiary-fixed-dim';
      case 'ai-llm':
        return 'bg-primary-fixed text-surface-tint dark:bg-surface-tint/20 dark:text-primary-fixed-dim';
      default:
        return 'bg-surface-container text-on-surface-variant dark:bg-inverse-surface/30 dark:text-outline-variant';
    }
  };

  return (
    <div className="py-xl">
      {/* Title Section */}
      <div className="mb-12">
        <h2 className="font-display text-display text-on-surface mb-sm dark:text-on-surface">
          Select Your Path
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl dark:text-outline-variant">
          Choose your trajectory in the data ecosystem. Your learning roadmap will be dynamically tailored to your selected discipline.
        </p>
      </div>

      {/* Path Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {Object.values(PATHS).map((path) => {
          const isActive = activePath === path.id;
          const isAnalysis = path.id === 'data-analysis';

          return (
            <div
              key={path.id}
              className={`rounded-xl p-lg flex flex-col relative group transition-all hover:-translate-y-1 ${getPathCardStyles(
                path.id,
                isActive
              )}`}
            >
              {/* Highlight badge for Data Analysis (Prerequisite) */}
              {isAnalysis && (
                <div className="absolute -top-3 right-lg bg-primary text-on-primary font-label-md text-xs px-2.5 py-1 rounded-full flex items-center shadow-sm dark:bg-primary-container dark:text-on-primary-container">
                  <span className="material-symbols-outlined text-[14px] mr-1">key</span>{' '}
                  Prerequisite
                </div>
              )}

              {/* Path Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-md ${getPathIconStyles(
                  path.id
                )}`}
              >
                <span className="material-symbols-outlined text-[28px]">
                  {path.icon}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm dark:text-on-surface">
                {path.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md flex-grow dark:text-outline-variant">
                {path.description}
              </p>

              {/* Skills/Tags */}
              <div className="flex flex-wrap gap-xs mb-lg">
                {path.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-code text-code bg-surface-dim text-on-surface rounded-md px-sm py-xs border ${
                      isActive ? 'border-outline-variant' : 'border-transparent'
                    } dark:bg-inverse-surface/40 dark:text-outline-variant dark:border-outline/20`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePathSelect(path.id)}
                className={`w-full font-label-md text-label-md py-2 px-4 rounded-lg transition-all flex justify-center items-center gap-1 group-hover:shadow-md ${
                  isActive
                    ? 'bg-primary text-on-primary hover:bg-primary/90 dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary-container/80'
                    : 'bg-transparent border border-outline-variant text-on-surface hover:border-primary hover:text-primary dark:border-outline/40 dark:text-on-surface dark:hover:border-primary-fixed dark:hover:text-primary-fixed'
                }`}
              >
                {isActive ? 'Current Path' : 'Select Path'}
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

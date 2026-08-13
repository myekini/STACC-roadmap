'use client';

import { useState } from 'react';
import {
  BookOpen,
  Code2,
  Download,
  FileCode,
  Layers,
  Plus,
  Video,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function CurriculumManager() {
  const userData = useUserData();
  const { paths, nodesByPath, tasks, resources } = userData;

  const [selectedPathId, setSelectedPathId] = useState<string>(paths[0]?.id ?? 'foundations');
  const [selectedNodeSlug, setSelectedNodeSlug] = useState<string | null>(null);

  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourcePlatform, setNewResourcePlatform] = useState('');
  const [newResourceType, setNewResourceType] = useState<'video' | 'documentation'>('video');

  const activePath = paths.find((p) => p.id === selectedPathId) ?? paths[0];
  const pathNodes = nodesByPath[selectedPathId] ?? [];
  const activeNode = pathNodes.find((n) => n.slug === selectedNodeSlug) ?? pathNodes[0];

  const activeNodeResources = activeNode
    ? resources.filter((r) => r.node_id === activeNode.id)
    : [];

  const activeNodeTasks = activeNode
    ? tasks.filter((t) => t.node_id === activeNode.id)
    : [];

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paths, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stacc_curriculum_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Curriculum & Course Control</h2>
          <p className="text-xs text-on-surface-variant">Manage career tracks, skill tree modules, learning resources, and quiz/code tasks.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportJson} className="font-code text-xs gap-1.5 border-outline-variant">
            <Download className="h-3.5 w-3.5" /> Export Seed JSON
          </Button>
        </div>
      </div>

      {/* Career Track Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {paths.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelectedPathId(p.id);
              setSelectedNodeSlug(null);
            }}
            className={cn(
              'px-4 py-2 font-code text-xs font-semibold rounded-xl border transition-all shrink-0',
              selectedPathId === p.id
                ? 'border-cyan bg-cyan/15 text-cyan font-bold shadow-sm'
                : 'border-outline-variant/60 bg-surface-card text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main Split Layout: Modules list vs Module Editor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Modules List in this Track */}
        <div className="space-y-3 rounded-2xl border border-outline-variant/80 bg-surface-card p-5">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h3 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan" />
              {activePath?.title} Modules ({pathNodes.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {pathNodes.map((n, index) => {
              const isSelected = activeNode?.id === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNodeSlug(n.slug)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3',
                    isSelected
                      ? 'border-cyan bg-cyan/10 text-on-surface font-semibold shadow-md'
                      : 'border-outline-variant/40 bg-surface/40 text-on-surface-variant hover:border-cyan/40',
                  )}
                >
                  <div>
                    <p className="font-bold text-on-surface">{index + 1}. {n.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">{n.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="font-code text-[10px] shrink-0 border-outline-variant">
                    {n.est_hours}h
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Module Details & Resource Editor */}
        {activeNode ? (
          <div className="lg:col-span-2 space-y-6 rounded-2xl border border-outline-variant/80 bg-surface-card p-6">
            <div className="flex items-start justify-between border-b border-outline-variant/60 pb-4">
              <div>
                <span className="font-code text-xs text-cyan font-bold uppercase tracking-wider">Module {activeNode.order}</span>
                <h3 className="font-display text-xl font-bold text-on-surface mt-1">{activeNode.name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{activeNode.subtitle}</p>
              </div>

              <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan font-code text-xs">
                {activeNode.est_hours} Hours Est.
              </Badge>
            </div>

            {/* Resources Management Section */}
            <div className="space-y-4">
              <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan" />
                Learning Resources ({activeNodeResources.length})
              </h4>

              <div className="space-y-2">
                {activeNodeResources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {res.type === 'video' ? <Video className="h-4 w-4 text-cyan shrink-0" /> : <FileCode className="h-4 w-4 text-secondary shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate">{res.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{res.platform} · {res.url}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Resource Form */}
              <div className="rounded-xl border border-cyan/30 bg-cyan/[0.04] p-4 space-y-3">
                <p className="font-code text-xs font-bold text-cyan">Add Free Resource to Module</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Resource Name (e.g. Intro to Python)"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Platform (e.g. YouTube freeCodeCamp)"
                    value={newResourcePlatform}
                    onChange={(e) => setNewResourcePlatform(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Resource URL (https://...)"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="sm:col-span-2 text-xs"
                  />
                  <select
                    value={newResourceType}
                    onChange={(e) => setNewResourceType(e.target.value as 'video' | 'documentation')}
                    className="rounded-xl border border-outline-variant bg-surface-card px-3 py-2 text-xs text-on-surface focus:outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    if (!newResourceName || !newResourceUrl) return;
                    setNewResourceName('');
                    setNewResourceUrl('');
                    setNewResourcePlatform('');
                  }}
                  className="rounded-lg font-code text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Resource
                </Button>
              </div>
            </div>

            {/* Checklist Tasks Section */}
            <div className="space-y-4 pt-4 border-t border-outline-variant/60">
              <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                <Code2 className="h-4 w-4 text-cyan" />
                Module Tasks & Checkpoints ({activeNodeTasks.length})
              </h4>

              <div className="space-y-2">
                {activeNodeTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="font-code text-[9px] uppercase border-cyan/30 text-cyan">
                        {t.type}
                      </Badge>
                      <p className="font-semibold text-on-surface truncate">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-outline-variant bg-surface-card">
            <p className="text-sm text-on-surface-variant">Select a module from the list to view and manage its curriculum content.</p>
          </div>
        )}
      </div>
    </div>
  );
}

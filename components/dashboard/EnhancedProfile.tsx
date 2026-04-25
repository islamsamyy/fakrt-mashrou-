'use client';

import React from 'react';
import Link from 'next/link';

export interface ProfileData {
  id: string;
  name: string;
  role: 'founder' | 'investor';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  stats?: {
    label: string;
    value: string | number;
  }[];
  badges?: {
    label: string;
    icon: string;
    color: string;
  }[];
}

interface EnhancedProfileProps {
  profile: ProfileData;
}

export function EnhancedProfile({ profile }: EnhancedProfileProps) {
  return (
    <div className="w-full bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-3xl relative overflow-hidden group hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header with avatar and basic info */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-border/50">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-xl border-2 border-primary-container/30 overflow-hidden bg-surface-container-lowest flex items-center justify-center">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-4xl text-foreground/50">account_circle</span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-right">
            <h2 className="font-headline text-2xl font-black text-foreground mb-1 uppercase tracking-tight">
              {profile.name}
            </h2>
            <p className="text-sm text-primary-container font-headline font-bold uppercase tracking-widest mb-3">
              {profile.role === 'founder' ? 'صاحب مشروع' : 'مستثمر'}
            </p>

            {profile.bio && (
              <p className="text-sm text-foreground/85 font-body text-base leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Location and links */}
            <div className="flex flex-wrap justify-end gap-3 mt-4">
              {profile.location && (
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span>{profile.location}</span>
                </div>
              )}

              {/* Social links */}
              <div className="flex gap-2">
                {profile.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded flex items-center justify-center bg-foreground/5 hover:bg-primary-container/20 transition-all text-foreground/60 hover:text-primary-container"
                  >
                    <span className="material-symbols-outlined text-sm">share</span>
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded flex items-center justify-center bg-foreground/5 hover:bg-blue-500/20 transition-all text-foreground/60 hover:text-blue-400"
                  >
                    <span className="material-symbols-outlined text-sm">work</span>
                  </a>
                )}
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded flex items-center justify-center bg-foreground/5 hover:bg-slate-400/20 transition-all text-foreground/60 hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {profile.stats && profile.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-border/50">
            {profile.stats.map((stat, i) => (
              <div key={i} className="text-center md:text-right">
                <p className="text-sm font-data font-black text-primary-container mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground/80 font-headline font-bold uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="flex flex-wrap justify-end gap-3">
            {profile.badges.map((badge, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-headline font-bold uppercase tracking-widest ${badge.color}`}
              >
                <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

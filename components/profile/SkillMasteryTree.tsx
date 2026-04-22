"use client";

import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

interface Skill {
  name: string;
  level: number;
  icon: string;
  color: string;
}

interface SkillMasteryTreeProps {
  skillTree: Skill[];
}

export function SkillMasteryTree({ skillTree }: SkillMasteryTreeProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Icon name="rocket" className="w-4 h-4 text-purple-500" />
          Skill Mastery Tree
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {skillTree.map((skill) => (
          <Link 
            key={skill.name} 
            href={`/questions?search=${encodeURIComponent(skill.name)}`}
            className="block group/skill hover:scale-[1.01] transition-all"
          >
            <div className="space-y-3 p-4 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${skill.color} p-[1px]`}>
                    <div className="w-full h-full rounded-xl bg-[#0d1117] flex items-center justify-center">
                      <Icon name={skill.icon} className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover/skill:text-primary transition-colors">{skill.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Level {Math.floor(skill.level / 20) + 1}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-white/60">{skill.level}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                <div 
                  className={`h-full bg-linear-to-r ${skill.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Connection Lines (Visual Polish) */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Keep solving to unlock advanced specializations</p>
      </div>
    </div>
  );
}

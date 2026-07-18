"use client";

import { chapters } from "@/content/theory/chapters";
import Link from "next/link";

export default function ChapterTree() {
  return (
    <aside className="w-80 h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl p-6 overflow-y-auto">

      <h2 className="text-xl font-bold mb-8">
        TransLens Theory
      </h2>

      <div className="space-y-6">

        {chapters.map((chapter)=>(
          <div key={chapter.id}>

            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
              {chapter.title}
            </h3>


            <div className="space-y-2">

              {chapter.children.map((item)=>(
                <Link
                  key={item.id}
                  href={`/theory/${item.id}`}
                  className="
                  block
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  text-gray-300
                  hover:bg-white/10
                  hover:text-white
                  transition
                  "
                >
                  {item.title}
                </Link>
              ))}

            </div>

          </div>
        ))}

      </div>

    </aside>
  );
}
import TheoryLayout from "@/components/theory/TheoryLayout";
import {chapter1} from "@/content/theory/chapter1";


export default function ChapterPage(){

return (

<TheoryLayout>

<h1 className="
text-6xl
font-bold
tracking-tight
mb-6
">

{chapter1.title}

</h1>


<p className="
text-xl
text-gray-400
mb-12
">

{chapter1.subtitle}

</p>


<div className="space-y-12">


{chapter1.sections.map((section,index)=>(

<section
key={index}
className="
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-8
"
>

<h2 className="text-3xl font-semibold mb-4">

{section.title}

</h2>


<p className="text-gray-300 leading-relaxed">

{"content" in section && section.content}

</p>


</section>

))}


</div>


</TheoryLayout>

)

}
import ChapterTree from "./ChapterTree";

export default function TheoryLayout({
 children,
}:{
 children:React.ReactNode
}){

return (

<div className="
flex
min-h-screen
bg-[#05070D]
text-white
">

<ChapterTree/>

<main className="
flex-1
p-12
max-w-6xl
">

{children}

</main>


</div>

)

}
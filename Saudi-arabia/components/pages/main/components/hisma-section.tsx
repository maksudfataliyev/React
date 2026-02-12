import Image from 'next/image';

export default function HismaSection() {
  return (
    <section className="text-white px-6 py-10 max-w-1xl mx-auto flex flex-col items-center">
      
      <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden">
        <Image 
          src="/hisma-desert.jpg" 
          alt="Hisma Desert" 
          fill 
          className="object-cover"
          priority
        />
        
        <div className="absolute bottom-10 left-10">
          <h2 className="text-4xl md:text-5xl font-['Imperial_Script'] text-white">Hisma</h2>
          <h1 className="text-5xl md:text-7xl font-bold font-['Poppins'] -mt-3">Desert</h1>
        </div>
        
        <div className="absolute bottom-10 right-10 flex items-center gap-2 bg-black/40 backdrop-blur-sm p-1.5 pr-4 rounded-full border border-white/10">
           <Image src="/arab.png" alt="Traveler" width={32} height={32} className="rounded-full" />
           <div className="text-[10px]">
              <p className="font-bold leading-none">Wazeem Al Mulk</p>
              <p className="opacity-60 leading-none mt-0.5">Traveler</p>
           </div>
        </div>
      </div>

      <div className="mt-12 w-full px-4 md:px-10">
      <p className="font-['Poppins'] text-center text-lg md:text-2xl leading-relaxed opacity-80 font-extralight max-w-[1400px] mx-auto tracking-wide">
        The Hisma Desert in Saudi Arabia is a realm of ethereal beauty that captivates the senses. 
        Its vast expanse of golden sand dunes, sculpted by the winds of time, creates a 
        mesmerizing landscape that stretches as far as the eye can see. As the sun sets, 
        painting the sky with vivid hues.
      </p>
    </div>

      <div className="mt-12 relative group cursor-pointer overflow-hidden rounded-2xl w-full h-[200px] md:h-[250px]">
        <Image 
          src="/explore-saudi.png" 
          alt="Explore Saudi" 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-10">
          <h3 className="text-3xl md:text-4xl font-bold font-['Poppins']">
            Explore <br /> Saudi Arabia
          </h3>
          <div className="w-12 h-12 border border-white/50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
            <span className="text-2xl">→</span>
          </div>
        </div>
      </div>
    </section>
  );
}
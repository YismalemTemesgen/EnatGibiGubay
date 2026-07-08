import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ArrowLeft, Building2 } from "lucide-react";

export const Route = createFileRoute("/about/university")({
  head: () => ({
    meta: [
      { title: "ስለ ወልቂጤ ዩኒቨርሲቲ — ታሪካዊ ዳራ" },
      {
        name: "description",
        content:
          "የወልቂጤ ዩኒቨርሲቲ ማጠቃለያ እና ታሪካዊ ዳራ — ከመመሥረቱ ጀምሮ ያለው እድገት፣ ኮሌጆች እና የተማሪዎች ቁጥር።",
      },
    ],
  }),
  component: UniversityPage,
});

const paragraphs = [
  "የወልቂጤ ዩኒቨርሲቲ የተመሠረተው በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የሚኒስትሮች ምክር ቤት አዋጅ ቁጥር 1097/2011 መሠረት ሲሆን፣ ይህም አገሪቱ ማኅበራዊና ኢኮኖሚያዊ ሽግግርን ለማፋጠን ካቀደችው የከፍተኛ ትምህርት ስትራቴጂካዊ ማስፋፊያ አካል አንዱ ነው። ዩኒቨርሲቲው ብቁና ተወዳዳሪ ተማሪዎችን በማፍራት፣ ችግር ፈቺ ምርምሮችን በማካሄድ እና ማኅበረሰብ አቀፍ አገልግሎቶችን በመስጠት ረገድ የራሱን አዎንታዊ አስተዋጽዖ እንዲያበረክት ግልጽ ተልዕኮ ተሰጥቶታል።",
  "የወልቂጤ ዩኒቨርሲቲ አደረጃጀት ከተግባር ተኮር ትምህርት፣ ከጠንካራ የኢንዱስትሪ ትስስር፣ በፈጠራ ከተደገፈ ማስተማር እና ከሥራ ገበያ ፍላጎት ጋር ከተጣጣሙ የተግባራዊ ሳይንስ ዩኒቨርሲቲዎች (Universities of Applied Sciences - UAS) ዓለም አቀፋዊና አገራዊ እቅድ ጋር ሙሉ በሙሉ የሚስማማ ነው። በዚህ ማዕቀፍ ውስጥ በተግባር ላይ የተመሠረተ ትምህርትን፣ በክህሎት ላይ የተመሠረተ ሥርዓተ-ትምህርትን፣ እንዲሁም የማስተማር፣ የምርምር እና የማኅበረሰብ አገልግሎት ትስስርን በማጠናከር በእውነተኛው ዓለም የሚገጥሙ ተግዳሮቶችን ለመፍታት ይሠራል።",
  "ለዩኒቨርሲቲው መመሥረት መሠረት የተጣለው በ2003 ዓ.ም (2010 እ.ኤ.አ) ሲሆን፣ ይህም በዋናነት የማኅበረሰቡን ጥያቄና አገሪቱ ለሰለጠነ የሰው ኃይል ያላትን ፍላጎት ለማሟላት የተደረገ ጥረት ነው። በኢትዮጵያ በሦስተኛ ትውልድ የመንግሥት ዩኒቨርሲቲዎች ምድብ ውስጥ የተካተተውና በተግባራዊ ሳይንስ ዘርፍ የተመደበው የወልቂጤ ዩኒቨርሲቲ፣ ሕጋዊ የትምህርት ሥራውን በይፋ የጀመረው ኅዳር 15 ቀን 2005 ዓ.ም (November 24, 2012) ነው። የመጀመሪያው ዙር የማስተማር ሥራ የተከናወነው በወልቂጤ ኢንዱስትሪ ኮሌጅ ውስጥ ሲሆን፣ በወቅቱ 551 ተማሪዎች በሦስት ኮሌጆች (ኢንጂነሪንግና ቴክኖሎጂ፣ የተፈጥሮና ኮምፒውቴሽናል ሳይንስ፣ እንዲሁም ኮምፒውቲንግና ኢንፎርማቲክስ) ተመዝግበው ትምህርታቸውን ጀምረዋል።",
  "ዩኒቨርሲቲው ሥራ በጀመረበት ወቅት በተግባራዊ እና ቴክኖሎጂ ተኮር ዘርፎች ላይ ያተኮሩ 13 የመጀመሪያ ዲግሪ (Undergraduate) ፕሮግራሞችን አቅርቦ ነበር። ከእነዚህም መካከል ሲቪል ኢንጂነሪንግ፣ መካኒካል ኢንጂነሪንግ፣ ኤሌክትሪካል ኢንጂነሪንግ፣ ኮምፒውተር ሳይንስ፣ ኢንፎርሜሽን ቴክኖሎጂ፣ አፕላይድ ባዮሎጂ እና አፕላይድ ፊዚክስ ይገኙበታል። እነዚህ ፕሮግራሞች የተግባራዊ ሳይንስ ተቋማትን መገለጫዎች—በተለይም የቴክኒክ ብቃትን፣ የተግባር ክህሎት ማደግን እና ከኢንዱስትሪና ማኅበረሰብ ፍላጎት ጋር መጣጣምን—ያንጸባርቃሉ።",
  "የመጀመሪያው ምዕራፍ የመሠረተ-ልማት ግንባታ ከተጠናቀቀ በኋላ፣ ዩኒቨርሲቲው ከወልቂጤ ከተማ 14 ኪሎ ሜትር እንዲሁም ከአዲስ አበባ 174 ኪሎ ሜትር ርቀት ላይ ወደሚገኘው ዋናው ግቢው (ጉብሬ) ተዛውሯል። ይህ ሽግግር ለተቋሙ ዕድገት ትልቅ ምዕራፍ የነበረ ሲሆን፣ የትምህርት ጥራትን ለማሻሻል፣ የምርምር ሥራዎችን ለማስፋፋትና የማኅበረሰብ ተሳትፎን ለማጠናከር ያለውን አቅም በእጅጉ አሳድጎታል።",
  "ከአገራዊ ቅድሚያ ከሚሰጣቸው ጉዳዮች ጋር በተጣጣመ መልኩ የወልቂጤ ዩኒቨርሲቲ ፈጣን የአካዳሚክ እና መዋቅራዊ ማስፋፊያዎችን አድርጓል። በ2006 ዓ.ም (2013 እ.ኤ.አ) አጠቃላይ የፍላጎት ዳሰሳ ጥናቶችን ካካሄደና ከትምህርት ሚኒስቴር እንዲሁም ከዩኒቨርሲቲው ሴኔት ፈቃድ ካገኘ በኋላ፣ አራት ተጨማሪ ኮሌጆች ተመሥርተዋል፦ የጤና ሳይንስና ሕክምና፣ የማኅበራዊ ሳይንስና ሁማኒቲስ፣ የግብርና፣ እንዲሁም ቢዝነስና ኢኮኖሚክስ ኮሌጆች ናቸው። በ2007 ዓ.ም (2014 እ.ኤ.አ) የሕግ ትምህርት ቤት መከፈት የዩኒቨርሲቲውን የአካዳሚክ ይዘት ይበልጥ ያበለጸገው ሲሆን፣ አጠቃላይ የኮሌጆቹን ቁጥር ወደ ሰባት፣ የትምህርት ቤቱን ቁጥር ወደ አንድ አሳድጎታል። በወቅቱ በ32 የመጀመሪያ ዲግሪ ፕሮግራሞች 2,227 ተማሪዎች ተመዝግበው ነበር። በ2010 ዓ.ም (2018 እ.ኤ.አ) የባሕሪ ሳይንስ ኮሌጅ መመሥረትን ተከትሎ አጠቃላይ የኮሌጆች ቁጥር ወደ ስምንት አድጓል።",
  "ከተመሠረተበት ጊዜ ጀምሮ ዩኒቨርሲቲው ለአገሪቱ ኢኮኖሚ በተለያዩ ዘርፎች አስተዋጽዖ ማበርከት የሚችሉ ብቁ የሰው ኃይሎችን ለማፍራት ከፍተኛ ቁርጠኝነት አሳይቷል። የመጀመሪያው ዙር ምሩቃን ከአፕላይድ ባዮሎጂ እና አፕላይድ ፊዚክስ ትምህርት ክፍሎች የወጡ 65 ተማሪዎች ነበሩ። ባለፉት አሥር ዓመታት ውስጥ ዩኒቨርሲቲው ከ17,000 በላይ ተማሪዎችን ያስመረቀ ሲሆን፣ ይህም ተቋሙ ለአገር ግንባታ፣ ለቴክኖሎጂ ዕድገትና ለሰለጠነ የሰው ኃይል መፈጠር እያበረከተ ያለውን የጎላ ሚና ያሳያል።",
];

function UniversityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/about"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> ተመለስ
        </Link>

        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <header className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                  አማራጭ 1
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">
                  ስለ ወልቂጤ ዩኒቨርሲቲ
                </h1>
                <p className="mt-2 text-sm text-primary-foreground/90">
                  ማጠቃለያ እና ታሪካዊ ዳራ · Background
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-8">
            <h2 className="mb-4 border-l-4 border-primary pl-3 font-display text-lg font-bold text-foreground sm:text-xl">
              ማጠቃለያ እና ታሪካዊ ዳራ
            </h2>
            <div className="space-y-5 text-[15px] leading-8 text-foreground/90 sm:text-base sm:leading-9">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-justify">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <footer className="border-t border-border bg-muted/30 p-6">
            <Link
              to="/about"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> ወደ ንዑስ ምናሌ ተመለስ
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}

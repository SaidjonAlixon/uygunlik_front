"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Shield,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserStore } from "@/store/user.store";

// FAQ Accordion Component
const FAQAccordion = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "Metod qanchalik ishonchli? Homilador bo'lib qolmaymanmi?",
      answer: `Fertillikni kuzatishning Simptotermal Metodi ilmiy tadqiqotlar bo'yicha 99,6% aniqlikka ega. Foydalanuvchi kuzatuv ishlarini doimiy va aniq olib borsa, ko'zlangan maqsadga erishiladi. Agar Foydalanuvchi kuzatuv ishlarini to'liq amalga oshirmasa, xatolik (saqlanishni ko'zda tutganlarda - homiladorlik) yuzaga kelsa - bu faqatgina juftlikning zimmasida bo'ladi, metoddagi kamchilikda emas.`,
    },
    {
      question: "Spiralim bor, kursda qatnashish uchun oldirishim kerakmi?",
      answer: `Ha, kurs boshlanishidan oldin spiralni oldirgan, garmonal tabletkalar qabul qilsangiz, ularni ichishni to'xtatgan bo'lishingiz kerak.`,
    },
    {
      question: `Metodni tug'ruqdan keyin, hayz ko'rmay turib ham, emizikli davrda qo'llay olamanmi?`,
      answer: `Albatta. Kuzatuvlarga asoslanib, barcha ayollar tug'ruqdan keyingi 3 haftada fertil (unumdor) bo'lmasliklari aniqlangan. Undan keyingi davrda, emizishning to'liq yoki aralash ekanligiga qarab, STM qoidalari bo'yicha kuzatuvni boshlashingiz mumkin.`,
    },
    {
      question:
        "Hali turmushga chiqmagan qiz bolaman. Kurs men uchun foydali bo'ladimi?",
      answer: `Bu kursda har bir qiz va ayol bilishi shart bo'lgan hayz ilmi, o'ziga g'amxo'rlik qilish, hayz davrining har kunida - tana, hissiyotlar, va garmonlardagi tabiiy o'zgarishlarni kuzatish va tushunish kabi muhim bilimlar beriladi. Turmush qurishdan avval o'z tanangizni, ayollik tabiatingizni chuqurroq anglab, uning ritmiga mos yashashni o'rganish - bo'lajak sog'lom homiladorlikka tayyorgarlik bo'lishi bilan birga, kelajakda dunyoga keladigan qiz farzandingiz tarbiyasida ham bebaho poydevor bo'lib xizmat qiladi. Bu - nafaqat bugungi salomatligingizga, balki ertangi avlodingizga ham qaratilgan eng dono sarmoyalardan biridir.`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {faqData.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-red-100 overflow-hidden"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full p-6 text-left flex items-center justify-between hover/50 transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold text-red-900 pr-4">
              {item.question}
            </h3>
            <div className="flex-shrink-0 text-red-600">
              {openItems.includes(index) ? (
                <Minus className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {openItems.includes(index) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// Reviews Carousel komponenti
const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      name: "Asiya Ameen",
      handle: "@Ameenasiyaa",
      initial: "A",
      text: "Bismillah! Kurs haqidagi taassurotlarim judayam ijobiy. Uzoq yozib o'tirmiyman, bitta qilib etganda manga bu kurs bergan eng ASOSIY narsa ANIQLIK bo'ldi. Ko'nglim shunaqangi hotirjamki endi nimani qachon qanaqa qilish kereligini bilaman. O'z sog'ligimga zarar qilib saqlanuvchi vositalardan davomiy foydalanishdan qutulganimga va tanamga avvalgidan ko'ra ko'proq yaqinlashganimga o'zimni judayam yaxshi his qivomman...",
    },
    {
      name: "Dildora Baxtiyorovna",
      handle: "@hafiza_am",
      initial: "D",
      text: "Tabiiylikka avvaldan qiziqardim lekin sizni darslarizdan keyin organizmimiz naqadar mukammal ekanligini va biz sezmagan ahamiyat bermagan holatda ichimizda qancha o'zgarishlar, naslni davom ettrish uchun kurashlar bo'lib o'tar ekanligini bildim. Shunchaki hayratdaman.Biz esa faqat va faqat o'zimizni noqis aqlimiz bilan mukammal tizimga qanaqdir simlar (spiral) tiqib bu jarayonni toxtatmoqchi bolamiz. Aslida shunchaki tanamizni eshitish biroz etiborli bo'lish va qanday yaratilgan bolsak shunday yashab bersak boldi ekan❤❤...",
    },
    {
      name: "Elnora Rustamova",
      handle: "@RusstamvaM",
      initial: "E",
      text: "Assalamu Alaykum va rahmatullohi va barakatuh. Avvalosi Ummu Umayr darsida aytib o'tganidek Niyat To'gri qilib 2 dunyomizga manfaatli bo'lishni so'rab qolaman. darslar judayam tushinarli tilda har hil katta tushinarsiz jumlalarsiz yoritib berilgan. Ayniqsa manga yoqgani birinchi kirish darsini animatsiyalari xuddi miyyamga chizilganday yodimda qoldi. Bu darslarni har bir ayol bilishi kerak deb o'ylayman...",
    },
    {
      name: "Xadicha Jo'rayeva",
      handle: "@zxadicha",
      initial: "X",
      text: "Hayz haqida ma'lumotlar, ayniqsa uni kasallik emas, ona bo'lish qobilyati ekanini eslatganiz yoqdi. Man birinchi hayzimni ko'rganimda qo'rqib ketganman, nimaligini bilmaganman. Buni yomon ish dib o'ylaganman. Hammadan yashirganman. Shu bilan 18-20 yoshimgacha siklim umuman buzilib ketgan. Endi tartibga keldi. Mana shu travmacham esimga tushdi. Hayz haqida shar'iy va tibbiy bilimga birinchi o'rinda ega bo'lishimiz kerak boshqa bilimladan oldin. Mana shu narsani tushundim. Karta yuritish esa qiyin emas qiziqarli tuyildi manga. Organizmimdagi ruhiy, jismoniy holatni chizma varianti desa bo'larkan. Bizani hissiy holatimiz, sog'ligimiz kartamizda...",
    },
    {
      name: "Robiya Muhammedova",
      handle: "@uxti_ra",
      initial: "R",
      text: "Ассаламу алейкум ва рахматуллоҳи ва барокатух 👋 Нозимапа ман сизга шунчеки курсмас, балки ўз ҳаётимми, саломатлигимми ва аёллик ҳақида чуқурроқ тушунишимми таъминлаган, ҳақиқий билим манбаига айланган котта имконият учун миннатдорлик билдирмоқчиман. Бу курсга қатнашиш довомида аёлларни овуляция бўлиш ва бўлмаслиги вақти, естроген ва прогестерон даврлари ҳақида кенг ва асосли билимлани ўргандим. Бу билимла ман учун шунчеки маълумотмас, балки ўзимми ички органларимми...",
    },
    {
      name: "Ummu Muhsin",
      handle: "@toolibah_",
      initial: "U",
      text: "Har bitta darssi ko'rganimda ko'zimdan yulduzchala chiqadi, taassurotlarim judayam ko'p. Qisqa qib etadigan bo'sam, stm darsi har bitta ayol kishi bilishi kere bo'gan ilmligiga amin bo'ldim, bu faqatgina homiladorlidan saqlanishshi o'zimas, ayollaga tanasi bn aloqa o'rnatish, o'ziga ahamiyatli bo'lish, sog'lig'i haqida qayg'urishshi o'rgatarkan va homilador bo'moqchi bo'ganla uchunam ayni muddao. Darsla qiziqarli va oson qib chuntirilgan, ayniqsa animatsiyala mavzuni yanayam aniqro chunishga yordam berdi. Vaaa gap ayollik haqida ketvotkanakan, kursda faqatgina stm ni o'zimas, fiqh...",
    },
    {
      name: "Muhammad's wife",
      handle: "@zavjatuM",
      initial: "M",
      text: "Assalamu alaykum Nozima opa darsliklar juda sifatli tayyorlangan ozimni anchagina angladim ozimni kuzatishni organdim tahlil qilishni ham. Avvalgi homiladorlik vaqtimda bolgan muammolarni sababini bilmasdim tabiiyki vrachlar ham tushuntirib bermagan edi har bir darslikda man homilador vaqtimda bolgan muammolarni ildizini ham topdim va keyingi homilada albatta buni oz nazoratimga olaman deb niyat qildim. Kurs faqat saqlanish emas balki ongli ravishda farzandli bolish va tugruqqa tayarlov...",
    },
    {
      name: "Aisha Shoakmalova",
      handle: "@shoakmalova_a",
      initial: "A",
      text: "Kursda qatnashishdan maqsad stm haqidagi bilimlarni qaytarish, yangilash va puxtalash edi... Lekin aslida bundan avvalgi kursim stmga progrev bo'lgandek tuyylib qoldi to'g'risi. Savollarimga aqlim qoniqadigan darajada javob ololyotganimdan judayam hursand bo'vomman, darslarga alohida mehr berib o'tilishi shundoq sezilib turibdi, mazza qilib ko'raman. Qo'shimcha materiallarni aytmasam xato qilgan bölaman...",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000); // 5 soniya

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: -currentIndex * 100 + "%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {reviews.map((review, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="bg-white p-8 rounded-lg shadow-md border border-red-100 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4 flex items-center justify-center">
                    <img
                      className="w-full h-full object-cover"
                      src={`/images/sharh/${index + 1}.jpg`}
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 text-lg">
                      {review.name}
                    </h4>
                    <p className="text-sm text-gray-600">{review.handle}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  "{review.text}"
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-red-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#main", label: "Bosh sahifa" },
    { href: "#courses", label: "Kurslar" },
    { href: "#author", label: "Muallif haqida" },
    { href: "#faq", label: "FAQ" },
    { href: "#pricing", label: "Tariflar" },
    { href: "#reviews", label: "Sharhlar" },
  ];

  return (
    <div className="min-h-screen bg-[#FEFBEE] text-gray-800 overflow-x-hidden">
      {/* --- Header --- */}
      <div
        id="main"
        className="container mx-auto px-4 sm:px-6 lg:px-8 top-0 left-0 absolute lg:static z-50"
      >
        <div className="flex items-center lg:justify-end py-2">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-medium text-gray-600 hover:text-red-800 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4 ml-10">
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-800 hover"
                >
                  {user.first_name}
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  className="text-xl text-red-900 transition-all"
                  href="/auth"
                >
                  Kirish
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 rounded-full text-white bg-red-800">
                <span className="sr-only">Open menu</span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-red-900 text-white border-none p-8"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader className="mb-8">
                <SheetTitle className="text-white text-2xl font-bold text-left"></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="text-2xl hover:underline underline-offset-4 text-left"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href={"/auth"}
                    className="text-2xl hover:underline underline-offset-4 text-left"
                  >
                    Kirish
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href={"/register"}
                    className="text-2xl hover:underline underline-offset-4 text-left"
                  >
                    Ro'yhatdan o'tish
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <main>
        {/* --- Hero Section --- */}
        <section className="relative w-full h-screen md:h-full">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex flex-col items-center justify-center text-center text-[#5D1111] pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img
                  src="/images/logo-decorated.png"
                  alt="Uyg'unlik Logo"
                  className="h-11 md:h-24 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.7))]"
                />
              </motion.div>{" "}
              <motion.h1
                className="font-dancing text-xl sm:text-3xl md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Ayollik tabiatingiz bilan hamohanglikda yashang
              </motion.h1>
              <motion.p
                className="mx-auto text-sm sm:text-lg font-bold md:text-xl mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Tabiiy usul bilan homiladorlikni<br />
                rejalashtiring yoki oldini oling
              </motion.p>
              <motion.p
                className="mx-auto border-t border-b border-[#5D1111] max-w-[120px] w-full mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className=""
              >
                <ul className="text-[#5D1111] flex items-center flex-col sm:flex-row gap-x-1">
                  <li className="font-bold">Start:</li>
                  <li>Yanvar, 2026</li>
                  <li className="font-bold">Davomiyligi:</li>
                  <li>8 hafta</li>
                </ul>
              </motion.div>
            </div>
            <video
              src="/women.mp4"
              poster="/images/header.jpg" // Fallback image
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            ></video>
            <Link
              href={"#pricing"}
              className="absolute h-40 w-40 border rounded-full bottom-40 z-50 flex items-center justify-center text-white"
            >
              <p className="text-xl">
                ISHTIROK <br /> ETAMAN
              </p>
              <span className="h-4 w-4 bg-white rounded-full right-4 bottom-4 absolute"></span>
            </Link>
            <div className="absolute z-10 bottom-0 h-[300px] md:h-[400px] w-full left-0 bg-gradient-to-t from-red-900 from-20% to-transparent"></div>
          </div>
        </section>

        {/* kurslar kimlar uchun */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-red-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              KURS KIMLAR UCHUN?
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* 1. Doimiy xavotirda yashaydigan ayollar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <CardTitle className="text-red-900 text-center">
                      Doimiy xavotirda yashaydigan ayollar uchun
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-12 w-12 text-red-800" />
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Tabiiy yo'llar bilan homiladorlikdan saqlanishni
                      xohlaysiz, lekin zararli kontrasepsiya vositalaridan
                      foydalanishdan qo'rqasizmi? Simptotermal metod (STM)
                      yordamida:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          99.6% aniqlik bilan homiladorlikdan saqlanishni
                          o'rganasiz.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Tanangiz, kayfiyatingizdagi o'zgarishlar va hayz
                          davringizni tushuna boshlaysiz
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Hayzingiz qachon boshlanishini aniq bilib, stressiz
                          yashaysiz.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Juftingiz bilan ishonchli va ochiq munosabatlar
                          o'rnatishga erishasiz.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 2. Homilador bo'lishni xohlayotgan ayollar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <CardTitle className="text-red-900 text-center">
                      Homilador bo'lishni xohlayotgan, ammo qiyinchiliklarga
                      duch kelayotgan ayollar uchun
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-12 w-12 text-red-800" />
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Agar sizga aniq bepushtlik tashxisi qo'yilmagan bo'lsa,
                      STM orqali tabiiy usulda farzandli bo'lish imkoniyatini
                      oshirishingiz mumkin:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Eng yuqori ehtimolli homiladorlik kunlarini
                          aniqlaysiz.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Homiladorlikning dastlabki 10 haftasida tanangiz
                          resurslarini kuzatib borasiz.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Tug'ish sanangizni homiladorlik yuzaga kelgan kundan
                          boshlab hisoblay olasiz
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 3. Yaqinda ona bo'lgan ayollar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <CardTitle className="text-red-900 text-center">
                      Yaqinda ona bo'lgan va darhol homilador bo'lishni
                      istamaydigan ayollar uchun
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Award className="h-12 w-12 text-red-800" />
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Ko'plab emizikli onalar «emizish homiladorlikdan saqlaydi»
                      degan noto'g'ri tushunchaga ega. STM yordamida siz:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Hayzingiz hali tiklanmagan bo'lsa ham, 99.6% aniqlik
                          bilan, keyingi homiladorlikni rejalashtira olasiz
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Tug'ruqdan keyingi birinchi ovulyatsiyangizni
                          kuzatasiz.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Organizmga zarar yetkazmaydigan va juftingiz bilan
                          ishonchli munosabatda bo'lish imkonini beradigan
                          tabiiy usuldan foydalanasiz.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        {/* <section id="about" className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">
                Nima uchun bizni tanlaysiz?
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Bizning platformamiz ayollarga o'z salomatligini tabiiy va ilmiy
                asoslangan usullar bilan boshqarishga yordam beradi.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Card className="text-center border-red-100/70 h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/50">
                    <CardHeader>
                      <div className="mx-auto w-16 h-16 mb-4 bg-red-100/70 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-red-700" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-red-900">
                        Xavfsiz va tabiiy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Hech qanday kimyoviy preparatlar va yon ta'sirlarsiz,
                        faqat tabiiy usullar orqali o'z tanangizni nazorat
                        qiling.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* --- Course Content Section --- */}
        <section id="courses" className="py-16 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-red-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              KURS TARKIBI
            </motion.h2>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
              {/* I MODUL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src="/images/muallif.jpg"
                          alt="Nozima Khamraeva"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-red-900 text-lg">
                          I MODUL
                        </CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          Nozima Khamraeva
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Buyuk Britaniya "Natural Family Planning Teachers'
                      Association" uyushmasining sertifikatli treneri.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Videodarslar (20-30 daq.):
                      </h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Ayol va erkak reproduktiv tizimining anatomiya va
                            fiziologiyasi
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Simptotermal metod darslari
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Gormonlar, hayot tarzi va hayz ritmida yashash
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* II MODUL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src="/images/module-2.jpg"
                          alt="Sumayya Hanafi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-red-900 text-lg">
                          II MODUL
                        </CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          Sumayya Hanafi
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Islom fiqhi bo'yicha mutaxassis, Iordaniya qirolligida
                      Usul va Fiqh yo'nalishida bakalavr darajasiga ega.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Videodarslar (10-15 daq.):
                      </h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Ayollik fiqhini o'rganish ahamiyati
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Hayz, istihoza, nifos tushunchalari
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Tahorat, g'usl, oq ajralmalar haqida
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Er bilan yaqinlik masalalari
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* III MODUL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src="/images/module-3.jpg"
                          alt="Ummu Umayr"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-red-900 text-lg">
                          III MODUL
                        </CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          Ummu Umayr
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Diplomli psixolog-seksolog, integrativ nutritsiolog. 15+
                      kurs va loyihalar asoschisi; 2000+ ayol-qizlarni ijobiy
                      natijaga olib chiqqan mutaxassis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Videodarslik (35 daq.):
                      </h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Ruhiy va jismoniy omillarning ahamiyati
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            To'shak masalasidagi kelishmovchiliklar
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Jinsiy hayotga tabiiy saqlanishning ijobiy
                            ta'sirlari
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Tabiiy saqlanish kunlari uchun tavsiyalar
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* IV MODUL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src="/images/module-4.jpg"
                          alt="Sohiba Abdalniyozova"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-red-900 text-lg">
                          IV MODUL
                        </CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          Sohiba Abdalniyozova
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Doula, prenatal nutritsiolog. Ayollarga homiladorlik, oson
                      tug'ruq va tug'ruqdan keyingi tiklanishga yordam beradigan
                      mutaxassis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Videodarslik (25 daqiqa):
                      </h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Yoni-steam foydalari va uni uy sharoitida qilish
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Oyoq parlash ahamiyati
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* V MODUL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="md:col-span-2 lg:col-span-1"
              >
                <Card className="border-red-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src="/images/module-5.jpg"
                          alt="Ruvayha"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-red-900 text-lg">
                          V MODUL
                        </CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          Ruvayha
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      Diplom va sertifikatli Tabiiy Tibbiyot yo'lovchisi, doula,
                      tug'ruqqa tayyorlovchi murabbiy, gomeopat.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Videodarslik (40 daqiqa):
                      </h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-red-800 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            Sog'lom ayol bo'lish sirlari
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ilmiy Asoslangan Samaradorlik */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-red-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              ILMIY ASOSLANGAN SAMARADORLIK
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Chap qism: Ideal va Oddiy qo'llashda */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-6">
                  {/* Ideal qo'llashda */}
                  <Card className="border-red-200 bg-white">
                    <CardHeader className="text-center">
                      <CardTitle className="text-red-900 text-xl mb-2">
                        Ideal qo'llashda
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Har bir tavsiyaga qat'iy amal qilinganda
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-6xl font-bold text-red-800 mb-2">
                        99,6%
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        (Pearl ko'rsatkichi: 0,4)
                      </p>
                      <p className="text-xs text-gray-500">
                        Manba: Human Reproduction, 2007
                      </p>
                    </CardContent>
                  </Card>

                  {/* Oddiy qo'llashda */}
                  <Card className="border-red-200 bg-white">
                    <CardHeader className="text-center">
                      <CardTitle className="text-red-900 text-xl mb-2">
                        Oddiy qo'llashda
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Qo'llashda kamchiliklarga yo'l qo'yilganda
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-6xl font-bold text-red-800 mb-2">
                        98,2%
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        (Pearl ko'rsatkichi: 1,8)
                      </p>
                      <p className="text-xs text-gray-500">
                        Manba: Osteopath Fam Physician, 2013
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* O'ng qism: Taqqoslash */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-red-200 bg-white h-full">
                  <CardHeader className="text-center">
                    <CardTitle className="text-red-900 text-xl mb-2">
                      Taqqoslash
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      (oddiy foydalanish)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Grafik */}
                    <div className="mb-6">
                      <div className="flex items-end justify-between h-32 bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-20 bg-red-300 rounded-t"></div>
                          <span className="text-xs mt-2">15</span>
                          <span className="text-xs text-gray-600">
                            Prezervativ
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-12 bg-red-400 rounded-t"></div>
                          <span className="text-xs mt-2">9</span>
                          <span className="text-xs text-gray-600">
                            Gormonal
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-red-600 rounded-t"></div>
                          <span className="text-xs mt-2">1.8</span>
                          <span className="text-xs text-gray-600">STM</span>
                        </div>
                      </div>
                    </div>

                    {/* Jadval */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="font-semibold text-gray-700">Usul</div>
                        <div className="font-semibold text-gray-700">
                          Pearl ko'rsatkichi
                        </div>
                        <div className="font-semibold text-gray-700">
                          Samaradorlik
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center py-2 border-t">
                        <div className="text-sm">Prezervativ</div>
                        <div className="text-sm font-semibold text-red-600">
                          15
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          85%
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center py-2 border-t">
                        <div className="text-sm">Gormonal tabletkalar</div>
                        <div className="text-sm font-semibold text-red-600">
                          9
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          91%
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center py-2 border-t rounded">
                        <div className="text-sm font-semibold">
                          Simptotermal usul
                        </div>
                        <div className="text-sm font-bold text-red-800">
                          1.8
                        </div>
                        <div className="text-sm font-bold text-red-800">
                          98.2%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Kurs Muallifi */}
        <section id="author" className="py-16 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-red-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Kurs muallifi
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
              {/* Chap qism: Portret va ma'lumotlar */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-left"
              >
                <div className="mb-8">
                  <div className="w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden bg-gray-200 mb-6">
                    <img
                      src="/images/muallif.jpg"
                      alt="Nozima Khamraeva"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-2">
                    Kurs muallifi
                  </h3>
                  <h4 className="text-3xl font-bold text-red-800 mb-6">
                    Nozima Khamraeva
                  </h4>
                </div>

                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Buyuk Britaniya "Natural Family Planning Teachers'
                    Association" uyushmasining sertifikatli treneri.
                  </p>
                  <p className="text-lg leading-relaxed">
                    O'zbekistonda ilk marotaba ayollar uchun ko'p martalik
                    matoli tagliklarni tanishtirgan ayol.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Uchinchi farzandini tibbiy aralashuvlarsiz, ongli yondashib
                    uyda dunyoga keltirgan ona.
                  </p>
                </div>
              </motion.div>

              {/* O'ng qism: Sertifikat */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="border-red-200 bg-white shadow-lg max-w-sm">
                  <img className="h-full w-full" src="/nfp.jpg" alt="" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">
                Ko'p beriladigan savollar
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Kurs haqida sizni qiziqtirgan savollarga javoblar.
              </p>
            </motion.div>
            <FAQAccordion />
          </div>
        </section>

        {/* Sharhlar */}
        <section id="reviews" className="py-16 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-red-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              SHARHLAR
            </motion.h2>

            <ReviewsCarousel />
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">
                Tariflar
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                O'zingizga mos tarifni tanlang va sog'lom hayot sari ilk qadamni
                tashlang.
              </p>
            </motion.div>
            <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
              {/* BAZA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-full"
              >
                <Card className="border-gray-200 h-full flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">BAZA</CardTitle>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      1.799.000 UZS
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">STM darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Bonus dars "Yoni-steam"</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          2 oy davomida dars materiallariga kirish
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">1 to'liq hayz kuzatuvi</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Foydalanuvchi Sertifikati (o'rgatish huquqisiz)
                        </span>
                      </li>
                    </ul>
                    <Link
                      href={`https://t.me/stm_kurs?text=Assalomu alaykum yaxshimisiz. Men sizning BAZA kursingizni sotib olmoqchiman.`}
                      className="block pt-4"
                    >
                      <Button className="w-full bg-red-800 hover:bg-red-900">
                        Sotib olish
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* STANDART */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full"
              >
                <Card className="border-gray-200 h-full flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">STANDART</CardTitle>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      2.799.000 UZS
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">STM darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Ayollik Fiqhi darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Bonus dars "Yoni-steam"</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          3 oy davomida kurs materiallariga kirish
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          1 to'liq hayz xaritasi kuzatuvi
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Foydalanuvchi Sertifikati (o'rgatish huquqisiz)
                        </span>
                      </li>
                    </ul>
                    <Link
                      href={`https://t.me/stm_kurs?text=Assalomu alaykum yaxshimisiz. Men sizning STANDART kursingizni sotib olmoqchiman.`}
                      className="block pt-4"
                    >
                      <Button className="w-full bg-red-800 hover:bg-red-900">
                        Sotib olish
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* OPTIMAL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full"
              >
                <Card className="border-red-500 h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-red-900">
                      OPTIMAL
                    </CardTitle>
                    <div className="text-2xl font-bold text-red-800 mb-1">
                      3.799.000 UZS
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">STM darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Ayollik Fiqhi darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Bonus dars "Yoni-steam"</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Juftlar munosabati bo'yicha dars
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          4 oy davomida kurs materiallariga kirish
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          1 to'liq hayz xaritasi kuzatuvi
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Foydalanuvchi Sertifikati (o'rgatish huquqisiz)
                        </span>
                      </li>
                    </ul>
                    <Link
                      href={`https://t.me/stm_kurs?text=Assalomu alaykum yaxshimisiz. Men sizning OPTIMAL kursingizni sotib olmoqchiman.`}
                      className="block pt-4"
                    >
                      <Button className="w-full bg-red-800 hover:bg-red-900">
                        Sotib olish
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* VIP */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full"
              >
                <Card className="border-red-300 h-full flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-red-900">VIP</CardTitle>
                    <div className="text-2xl font-bold text-red-800 mb-1">
                      4.799.000 UZS
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">STM darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Ayollik Fiqhi darslari</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Bonus dars "Yoni-steam"</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Juftlar munosabati bo'yicha dars
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Sog'lom Ayollik Sirlari darsi
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          6 oy davomida kurs materiallariga kirish
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          3 to'liq hayz xaritasi kuzatuvi
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">
                          Foydalanuvchi Sertifikati (o'rgatish huquqisiz)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-600">
                          SOVG'A - ko'p martalik prokladka + maxsus termometr
                        </span>
                      </li>
                    </ul>
                    <Link
                      href={`https://t.me/stm_kurs?text=Assalomu alaykum yaxshimisiz. Men sizning VIP kursingizni sotib olmoqchiman.`}
                      className="block pt-4"
                    >
                      <Button className="w-full bg-red-800 hover:bg-red-900">
                        Sotib olish
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="py-20 sm:py-28 bg-[#FEFBEE] text-red-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-red-900">
                SIZGA MO'JIZA TAKLIF QILMAYMAN
              </h2>
              
              <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center text-lg text-red-900 leading-relaxed">
                  <p className="mb-8">
                    O'zingizni anglash yo'lida yo'lboshchilik, Sizni tushunuvchi, qo'llab-quvvatlovchi yo'ldoshlikni, Tinglash, O'z yo'lingizni hurmat qilishni taklif qilaman.
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-red-900 italic font-serif text-xl">
                    (C) Nozima Khamraeva
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8"
              >
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-red-800 hover:bg-red-900 text-white text-lg px-8 py-6 rounded-full font-bold shadow-lg"
                  >
                    Hoziroq boshlash
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
               
                <h3 className="text-xl font-bold"></h3>
              </div>
              <p className="text-gray-400 text-sm">
                
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">
                Tezkor havolalar
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#courses"
                    className="hover:text-white transition-colors text-sm"
                  >
                    Kurslar
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-white transition-colors text-sm"
                  >
                    Tariflar
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="hover:text-white transition-colors text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Yordam</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="https://t.me/stm_kurs"
                    target="_blank"
                    className="hover:text-white transition-colors text-sm"
                  >
                    Qo'llab-quvvatlash
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors text-sm"
                  >
                    Foydalanish shartlari
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Aloqa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="mailto:info@uygunlik.uz"
                    className="hover:text-white transition-colors text-sm"
                  >
                    info@uygunlik.uz
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://t.me/stm_kurs"
                    target="_blank"
                    className="hover:text-white transition-colors text-sm"
                  >
                    Telegram: @stm_kurs
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Uyg'unlik. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

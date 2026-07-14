import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  {
    title: "Website Development",
    text: "Hi NexCode, I would like to know more about your website development services.",
  },
  {
    title: "Custom Software System",
    text: "Hi NexCode, I am interested in developing a custom software solution for my business.",
  },
  {
    title: "Free Consultation",
    text: "Hi NexCode, I would like to get a free consultation regarding my business requirements.",
  },
];

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  const whatsappNumber = "94769747244";
  // Replace with your NexCode WhatsApp number
  // Example: 94771234567

  const openWhatsApp = (message) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  return (
   <div
  className="
  fixed
  bottom-6
  right-6
  z-[999]
  "
>


  {/* Popup Panel */}
  <AnimatePresence>

  {
    open && (

      <motion.div

        initial={{
          opacity:0,
          y:20,
          scale:.9
        }}

        animate={{
          opacity:1,
          y:0,
          scale:1
        }}

        exit={{
          opacity:0,
          y:20,
          scale:.9
        }}

        className="
        absolute
        bottom-16
        right-0
        w-[280px]
        rounded-3xl
        border
        border-border/70
        bg-card/90
        backdrop-blur-xl
        shadow-2xl
        p-4
        "

      >
            <div
              className="
              flex
              justify-between
              items-center
              mb-3
              "
            >
              <h3
                className="
                font-semibold
                text-foreground
                "
              >
                Start a Conversation
              </h3>

              <button
                onClick={() => setOpen(false)}
                className="
                text-muted-foreground
                hover:text-foreground
                "
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="
              space-y-2
              "
            >
              {messages.map((item) => (
                <button
                  key={item.title}
                  onClick={() => openWhatsApp(item.text)}
                  className="
                    w-full
                    text-left
                    rounded-xl
                    p-3
                    border
                    border-border/60
                    hover:border-primary/50
                    hover:bg-primary/5
                    transition
                    "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-foreground
                      "
                  >
                    {item.title}
                  </p>

                  <p
                    className="
                      text-xs
                      text-muted-foreground
                      mt-1
                      "
                  >
                    Click to message
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.95,
        }}
        className="
        w-14
        h-14
        rounded-full
        bg-[#25D366]
        text-white
        flex
        items-center
        justify-center
        shadow-2xl
        "
      >
        {open ? <X size={28} /> : <FaWhatsapp size={30} />}
      </motion.button>
    </div>
  );
}

import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40">
      <div
        className="
          max-w-7xl mx-auto
          px-6 py-2
          flex items-center justify-between
          text-[11px]
          text-zinc-500
        "
      >
        {/* Left text
        <span>
          Made by <span className="text-zinc-400">Aditya Garg</span>
        </span> */}

        {/* Icons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/2401030281-aditya-garg"
            target="_blank"
            className="hover:text-zinc-200 transition"
          >
            <Github size={13} />
          </a>

          <a
            href="https://linkedin.com/in/aditya-garg-043637343"
            target="_blank"
            className="hover:text-zinc-200 transition"
          >
            <Linkedin size={13} />
          </a>

          <a
            href="mailto:adiiigarg16@gmail.com"
            className="hover:text-zinc-200 transition"
          >
            <Mail size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}

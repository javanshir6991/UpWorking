import { motion } from "framer-motion"
import { Mail, Linkedin, Github, Globe } from "lucide-react"

const Footer = () => {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 text-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-14">
                {/* Top Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">JobConnect</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Discover your next opportunity and connect with employers worldwide.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            Company
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {["About", "Careers", "Blog", "Press"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-blue-600 transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            Support
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {["Help Center", "Terms", "Privacy", "Contact"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-blue-600 transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            Contact
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <a href="mailto:support@jobconnect.com" className="hover:text-blue-600">
                                    support@jobconnect.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" />
                                <span>Worldwide</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8" />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        © {new Date().getFullYear()} JobConnect. All rights reserved.
                    </motion.p>

                    <div className="flex gap-5">
                        {[{ Icon: Linkedin, href: "#" },
                        { Icon: Github, href: "#" },
                        { Icon: Globe, href: "#" }].map(({ Icon, href }, i) => (
                            <motion.a
                                key={i}
                                href={href}
                                whileHover={{ scale: 1.2, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-500 hover:text-blue-600 transition"
                            >
                                <Icon className="w-5 h-5" />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

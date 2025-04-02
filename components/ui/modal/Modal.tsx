import React,
{
useEffect,
useRef
}

from "react";

import {
    createPortal
}

from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: ()=> void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size="md"
}

: ModalProps) {
    const modalRef=useRef<HTMLDivElement>(null);

    useEffect(()=> {
            const handleEscape=(e: KeyboardEvent)=> {
                if (e.key==="Escape") {
                    onClose();
                }
            }

            ;

            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
                document.body.style.overflow="hidden";
            }

            return ()=> {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow="auto";
            }

            ;
        }

        , [isOpen, onClose]);

    // Modal dışına tıklama işlevi
    const handleBackdropClick=(e: React.MouseEvent)=> {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    }

    ;

    const getSizeClass=()=> {
        switch (size) {
            case "sm": return "max-w-md";
            case "md": return "max-w-lg";
            case "lg": return "max-w-2xl";
            case "xl": return "max-w-4xl";
            default: return "max-w-lg";
        }
    }

    ;

    if ( !isOpen) return null;

    // Portal kullanarak modali body'e append edelim (yerleşim sorunlarını önlemek için)
    return createPortal(<div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"

        onClick= {
            handleBackdropClick
        }

        > <div ref= {
            modalRef
        }

        className= {
            `bg-white rounded-lg shadow-xl w-full $ {
                getSizeClass()
            }

            transform transition-all`
        }

        > {
            title && (<div className="px-6 py-4 border-b border-gray-200" > <h3 className="text-lg font-medium text-gray-900" > {
                    title
                }

                </h3> </div>)
        }

        <div className="px-6 py-4" > {
            children
        }

        </div> </div> </div>,
        document.body);
}
import React, { useState, useEffect, VFC } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { BloomPass } from './postprocessing/BloomPass';
import { Effects } from './postprocessing/Effects';
import { FocusPass } from './postprocessing/FocusPass';
import { FXAAPass } from './postprocessing/FXAAPass';
import { ScreenPlane } from './ScreenPlane';

export const TCanvas: VFC = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [letterboxVisible, setLetterboxVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLetterboxVisible(false), 3000); // 3 seconds
        return () => clearTimeout(timer);
    }, []);

    const OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

    const renderPageContent = (title: string, content: JSX.Element) => (
        <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backdropFilter: 'blur(20px)', 
            backgroundColor: 'rgba(0, 0, 0, 0.6)', 
            zIndex: 10, 
            display: 'flex', 
            flexDirection: 'column', 
            animation: 'slideUp 0.s ease-out forwards' 
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px 20px', 
            }}>
                <button onClick={() => setCurrentPage('home')} style={{
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                }}>
                    Back
                </button>
                <div style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1.2em',
                    color: 'rgba(94,130,140,1)'
                }}>{title}</div>
                <div></div>
            </div>
            <div style={{ 
                padding: '20px', 
                overflowY: 'auto', 
                flexGrow: 1 
            }}>
                {content}
            </div>
        </div>
    );

    // Scroll event handler for fade-in effect
    useEffect(() => {
        const handleScroll = () => {
            const projectImages = document.querySelectorAll('.project-image');
            projectImages.forEach((image) => {
                const rect = image.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const isVisible = rect.top + scrollTop < window.innerHeight * 0.8; // Adjust visibility threshold

                if (isVisible) {
                    image.classList.add('fade-in');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: 'black' }}>
            {/* Letterbox Effect */}
            {letterboxVisible && (
                <>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '50%',
                        backgroundColor: 'black',
                        zIndex: 20,
                        animation: 'shrinkTop 2s ease-out forwards'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '50%',
                        backgroundColor: 'black',
                        zIndex: 20,
                        animation: 'shrinkBottom 2s ease-out forwards'
                    }}></div>
                </>
            )}

            {/* Navigation Bar */}
            <nav style={{
                position: 'absolute',
                bottom: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-around',
                width: '60%',
                fontFamily: 'Montserrat, sans-serif',
                pointerEvents: 'none',
            }}>
                <button onClick={() => setCurrentPage('about')} style={{ color: 'rgba(94,130,140,1)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>ABOUT ME</button>
                <button onClick={() => setCurrentPage('works')} style={{ color: 'rgba(94,130,140,1)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>WORKS</button>
                <button onClick={() => setCurrentPage('toolkits')} style={{ color: 'rgba(94,130,140,1)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>TOOLKITS</button>
                <button onClick={() => setCurrentPage('contact')} style={{ color: 'rgba(94,130,140,1)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>CONTACT ME</button>
            </nav>

            {/* Three.js Canvas */}
            <Canvas camera={OrthographicCamera} dpr={window.devicePixelRatio}>
                <ScreenPlane />
                <Effects sRGBCorrection={false}>
                    <FXAAPass />
                    <BloomPass />
                    <FocusPass />
                </Effects>
            </Canvas>

            {/* Conditional Content */}
            {currentPage === 'home' && (
                <>
                    <h1 style={{
                        height: 185,
                        width: 982,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        color: 'rgb(102, 138, 147)',
                        textAlign: 'center',
                        fontFamily: 'Jost , sans-serif',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        letterSpacing: '0.40em',
                        fontSize: '3.1em',
                        pointerEvents: 'none',
                        animation: 'fadeIn 3s ease-out forwards'
                    }}>LOGESHWAR RAMASAMY</h1>
                    <p style={{
                        height: 85,
                        width: 985,
                        position: 'absolute',
                        top: '55%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        color: 'rgba(94,130,140,1)',
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        letterSpacing: '0.94em',
                        pointerEvents: 'none',
                        animation: 'fadeIn 3s ease-out forwards'
                    }}>CREATIVE | DESIGNER | DEVELOPER</p>
                </>
            )}

            {currentPage === 'works' && renderPageContent('', (
                <>
                    <h1 style={{
                        opacity: '25%',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '0',
                        color: 'rgba(94,130,140,1)',
                        fontSize: '10.5em',  // Increase font size
                        textAlign: 'center',  // Center align text
                        marginTop: '20px',  // Add some top margin
                    }}>MY WORKS</h1>
                    <h1 style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: 'rgba(94,130,140,1)',
                        fontSize: '1.5em',  // Increase font size
                        textAlign: 'center',  // Center align text
                        marginTop: '-15%',  // Add some top margin
                        animation: 'fadeIn 2s ease-out forwards',
                        letterSpacing: '1.0em'

                    }}>PROJECTS | COLLABORATIONS</h1>
                    <div className="project" style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'rgba(94,130,140,1)'
                        }}>Project 1</h2>
                        <div className="project-image fade-in" style={{ // Ensure to add fade-in class
                            position: 'relative',
                            width: '300px',
                            height: '300px',
                            margin: '0 auto',
                            overflow: 'hidden',
                            perspective: '1000px',
                            opacity: 0, // Start with opacity 0 for fade-in effect
                            transition: 'opacity 1s ease'
                        }}>
                            <img src="\LOGESHWAR.png" alt="Project 1" style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }} />
                        </div>
                        <p style={{
                            fontFamily: 'Montserrat, sans-serif',
                            color: 'rgba(94,130,140,1)'
                        }}>Description of project 1...</p>
                    </div>
                    {/* Repeat similar structure for other projects */}
                </>
            ))}

            {currentPage === 'about' && renderPageContent('', (
                <>
                    <h1 style={{
                        opacity: '25%',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '0',
                        color: 'rgba(94,130,140,1)',
                        fontSize: '10.5em',  // Increase font size
                        textAlign: 'center',  // Center align text
                        marginTop: '20px',  // Add some top margin
                        animation: 'zoomIn 1s ease-out forwards'
                    }}>ABOUT ME</h1>
                    <h1 style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: 'rgba(94,130,140,1)',
                        fontSize: '1.5em',  // Increase font size
                        textAlign: 'center',  // Center align text
                        marginTop: '-15%',  // Add some top margin
                        animation: 'fadeIn 2s ease-out forwards',
                        letterSpacing: '1.0em'
                    }}>BIO | PASSIONS | GOALS</h1>
                    <p style={{
                        position: 'absolute',
                        width: '70%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)',
                        top: '50%'
                    }}>Dedicated to honing skills as a web developer and designer, focusing on advancing coding proficiency and technical expertise. I invest significant time mastering various programming languages and concepts to elevate design capabilities. By refining these skills, I aim to deliver compelling web solutions that seamlessly blend creativity with functionality, ensuring an impactful user experience.</p>
                    {/* Add more sections as needed */}
                </>
            ))}

            {currentPage === 'toolkits' && renderPageContent('Toolkits', (
                <>
                    <h2 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Toolkit 1</h2>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Description of toolkit 1...</p>
                    <h2 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Toolkit 2</h2>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Description of toolkit 2...</p>
                    {/* Add more toolkits as needed */}
                </>
            ))}

            {currentPage === 'contact' && renderPageContent('Contact Me', (
                <>
                    <h2 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Get in Touch</h2>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Email: example@example.com</p>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(94,130,140,1)'
                    }}>Phone: 123-456-7890</p>
                    {/* Add more contact information as needed */}
                </>
            ))}
        </div>
    );
};

export default TCanvas;

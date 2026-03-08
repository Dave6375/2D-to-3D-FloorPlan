import React from 'react'
import {Box, ChevronDown} from "lucide-react";
import Button from "./Button";
import { useAuth, useUser, SignOutButton } from "@clerk/react-router";
import { useNavigate } from "react-router";

const Navbar = () => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleAuthClick = () => {
        if (!isSignedIn) {
            navigate('/sign-in');
        }
    }

    return (
        <header className='navbar'>
            <nav className='inner'>
                <div className='left'>
                    <div className='brand'>
                        <Box className='logo' />

                        <span className='name'>
                            Simplex
                        </span>
                    </div>

                    <ul className='links'>
                        <div className='dropdown'>
                            <a href='/' className='dropdown-trigger'>
                                Product <ChevronDown className='icon' />
                            </a>
                            <div className='dropdown-content'>
                                <a href='/'>Features</a>
                                <a href='/'>Solutions</a>
                                <a href='/'>Releases</a>
                            </div>
                        </div>

                        <div className='dropdown'>
                            <a href='/' className='dropdown-trigger'>
                                Pricing <ChevronDown className='icon' />
                            </a>
                            <div className='dropdown-content'>
                                <a href='/'>For Individuals</a>
                                <a href='/'>For Teams</a>
                                <a href='/'>Enterprise</a>
                            </div>
                        </div>

                        <div className='dropdown'>
                            <a href='/' className='dropdown-trigger'>
                                Community <ChevronDown className='icon' />
                            </a>
                            <div className='dropdown-content'>
                                <a href='/'>Forum</a>
                                <a href='/'>Discord</a>
                                <a href='/'>Events</a>
                            </div>
                        </div>

                        <a href='/'>Enterprise</a>
                    </ul>
                </div>

                <div className='actions'>
                    {isSignedIn ? (
                        <>
                            <span className='greeting'>Hello, {user?.firstName || user?.username}</span>
                            <SignOutButton>
                                <Button
                                    className='login'
                                    variant='ghost'
                                    size='sm'
                                >
                                    Log out
                                </Button>
                            </SignOutButton>
                        </>
                    ) : (
                        <Button
                            onClick={handleAuthClick}
                            className='login'
                            variant='ghost'
                            size='sm'
                        >
                            Log in
                        </Button>
                    )}


                    <a href='#upload'
                       className='cta'>Get Started</a>
                </div>
            </nav>
        </header>
    )
}
export default Navbar

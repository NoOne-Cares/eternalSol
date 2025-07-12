"use client"
import React, { useState } from 'react';
import WillsForMe from './willsForMe';
import MyWills from './myWills';

const SelectWill = () => {
    const [activeTab, setActiveTab] = useState<'myWills' | 'willsForMe'>('myWills');

    return (
        <div className="w-full items-center">
            <div className="mx-auto grid grid-flow-col justify-items-center w-xl h-10 items-center rounded-2xl shadow-md bg-[--accent]">
                <button
                    onClick={() => setActiveTab('myWills')}
                    className={`px-4 py-2 rounded-l-2xl transition-colors duration-200 font-medium ${activeTab === 'myWills'
                        ? 'bg-[--primary] text-[--primary-foreground]'
                        : 'bg-transparent text-[--accent-foreground] hover:bg-[--muted]'
                        }`}
                >
                    My Wills
                </button>
                <button
                    onClick={() => setActiveTab('willsForMe')}
                    className={`px-4 py-2 rounded-r-2xl transition-colors duration-200 font-medium ${activeTab === 'willsForMe'
                        ? 'bg-[--primary] text-[--primary-foreground]'
                        : 'bg-transparent text-[--accent-foreground] hover:bg-[--muted]'
                        }`}
                >
                    Wills For Me
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'myWills' && <MyWills />}
                {activeTab === 'willsForMe' && <WillsForMe />}
            </div>
        </div>
    );
};

export default SelectWill;

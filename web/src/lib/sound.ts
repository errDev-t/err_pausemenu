const sounds = {
    1: { name: "openSound", volume: 0.212 },
    2: { name: "clickSound", volume: 0.071 },
    3: { name: "hoverSound", volume: 0.141 },
    4: { name: "closeSound", volume: 0.212 },
} as const;

const audioElements: Partial<
    Record<keyof typeof sounds, HTMLAudioElement>
> = {};

export const preloadSounds = () => {
    Object.entries(sounds).forEach(([type, sound]) => {
        const audio = new Audio(`./sounds/${sound.name}.wav`);

        audio.preload = "auto";
        audio.volume = sound.volume;

        audioElements[
            Number(type) as keyof typeof sounds
        ] = audio;
    });
};

export const playSound = (type: 1 | 2 | 3 | 4) => {
    const audio = audioElements[type];

    if (!audio) {
        console.warn(`Sound ${type} has not been preloaded.`);
        return;
    }

    audio.currentTime = 0;

    audio.play().catch((err) => {
        console.warn(`Failed to play sound ${type}:`, err);
    });
};
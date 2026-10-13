import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { debugData } from "@/utils/debugData";
import { fetchNui } from "@/utils/fetchNui";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { cn } from "@/lib/utils";
import { playSound, preloadSounds } from "@/lib/sound";

debugData([
  {
    action: "updateData",
    data: {
      patchNotes: {
        version: "2.4.0",
        releaseDate: "SEPT 12, 2026",
        patchTitle: "This week on the server",
        backgroundImage: "./patch-bg.jpg",
        highlights: [
          { type: "add", updates: [{ text: "Initial release of the pause menu." }] },
          { type: "improved", updates: [{ text: "Improved menu transitions." }, { text: "Reduced UI latency." }] },
          { type: "fixed", updates: [{ text: "Fixed animation flickering." }, { text: "Corrected character positioning issues." }] },
        ],
      },
      menuSections: [
        [
          { label: "Radar", icon: "fa-location-crosshairs", action: { type: "clientEvent", event: "err_pausemenu:radar" } },
          { label: "Camera Mode", icon: "fa-camera", action: { type: "clientEvent", event: "err_pausemenu:camera" } },
        ],
        [
          { label: "Settings", icon: "fa-gear", action: { type: "clientEvent", event: "err_pausemenu:settings" } },
          { label: "Keybinds", icon: "fa-keyboard", action: { type: "clientEvent", event: "err_pausemenu:keybinds" } },
          { label: "Discord", icon: "fa-brands fa-discord", action: { type: "url", event: "https://discord.gg/yGUU59WjuM" } },
        ],
        [
          { label: "Close", icon: "fa-play", action: null },
          { label: "Disconnect", icon: "fa-power-off", danger: true, action: { type: "serverEvent", event: "err_pausemenu:disconnect" } },
        ],
      ],
    },
  },
]);

type HighlightType = "add" | "improved" | "fixed";

interface Highlight {
  type: HighlightType;
  updates: { text: string }[];
}

interface PatchNote {
  version: string;
  releaseDate: string;
  patchTitle?: string;
  backgroundImage: string;
  highlights: Highlight[];
}

interface MenuAction {
  type: "clientEvent" | "serverEvent" | "url" | "export";
  event: string;
}

interface MenuItem {
  label: string;
  icon: string;
  action: MenuAction | null;
  danger?: boolean;
}

interface PausemenuData {
  patchNotes: PatchNote;
  menuSections: MenuItem[][];
}

const highlightConfig: Record<HighlightType, { label: string; symbol: React.ReactNode; labelClassName: string }> = {
  add: {
    label: "NEW",
    symbol: <i className="fa-solid fa-plus w-3 shrink-0 text-center not-italic text-mainColor" />,
    labelClassName: "text-mainColor",
  },
  improved: {
    label: "IMPROVED",
    symbol: <i className="fa-solid fa-arrow-trend-up w-3 shrink-0 text-center not-italic text-[#e8e6da]" />,
    labelClassName: "text-inkFaint",
  },
  fixed: {
    label: "FIXED",
    symbol: <i className="fa-solid fa-wrench w-3 shrink-0 text-center not-italic text-[#7d7b73]" />,
    labelClassName: "text-inkFaint",
  },
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/* ---------------- Menu ---------------- */

function MenuPanel({ menu, visible, onAction }: { menu: MenuItem[][]; visible: boolean; onAction: (item: MenuItem) => void }) {
  let index = 0;

  return (
    <div className={cn("flex h-full w-1/2 items-center justify-start transition-[transform,opacity] duration-500", EASE, visible ? "translate-x-0 opacity-100" : "-translate-x-14 opacity-0")}>
      <nav
        aria-label="Pause menu"
        className={cn(
          "font-armio flex h-full w-full flex-col items-start justify-center gap-5 p-20 tracking-[-1.25px] text-ink [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] [transform-origin:left_center] [transform:perspective(900px)_rotateY(3deg)]",
          // dim every other button while one is hovered / keyboard-focused
          "[&:has(button:hover)_button:not(:hover)]:opacity-75 [&:has(button:focus-visible)_button:not(:focus-visible)]:opacity-75",
        )}
      >
        {menu.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex flex-col items-start gap-1">
            {section.map((item) => (
              <div key={item.label} className="menu-item-enter" style={{ animationDelay: `${120 + index++ * 45}ms` }}>
                <button
                  type="button"
                  onMouseEnter={() => playSound(3)}
                  onClick={() => (playSound(2), onAction(item))}
                  className={cn(
                    "group/item relative inline-flex cursor-pointer text-2xl font-bold uppercase focus:outline-none transition-[color,opacity] duration-200 ease-out",
                    item.danger ? "hover:text-[#ff5d5d] focus-visible:text-[#ff5d5d]" : "hover:text-mainColor focus-visible:text-mainColor",
                  )}
                >
                  <span aria-hidden className="absolute -left-5 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-full bg-current transition-[height] duration-200 group-hover/item:h-[70%] group-focus-visible/item:h-[70%]" />

                  <span className="inline-flex gap-3 transition-transform duration-200 ease-out group-hover/item:translate-x-2 group-focus-visible/item:translate-x-2">
                    <i className={cn("fa-fw shrink-0 translate-y-1 font-extrabold", !item.icon.includes("fa-brands") && "fa-solid", item.icon)} />
                    <span>{item.label}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

/* ---------------- Patch card ---------------- */

interface PatchCardProps {
  latest: PatchNote;
  patchesOpen: boolean;
  setPatchesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function PatchCard({ latest, patchesOpen, setPatchesOpen }: PatchCardProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  const open = hover || focus || patchesOpen;
  const versionLabel = latest.version.replace(/^v/i, "");
  const summary = latest.highlights.filter((h) => h.updates.length > 0);

  const hoverProps = {
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => setHover(false),
  };

  const togglePatches = () => {
    playSound(2);
    setPatchesOpen((p) => !p);
  };

  return (
    <div className="flex h-full w-1/2 items-center justify-end">
      <div className="pointer-events-none relative flex h-full w-fit items-center justify-end">
        {/* invisible hit zone so the peeking card is easy to hover */}
        <div aria-hidden {...hoverProps} className="pointer-events-auto absolute right-0 top-1/4 h-1/2 w-36" />

        <div
          className={cn(
            "pointer-events-none flex h-full w-fit items-center justify-end gap-1 transition-transform duration-500 [transform-origin:right_center]",
            EASE,
            open
              ? "[transform:perspective(1100px)_translate3d(-16px,0,0)_rotateY(-2.5deg)]"
              : "[transform:perspective(1100px)_translate3d(73%,0,0)_rotateY(-8deg)_scale(.95)] delay-100",
          )}
        >
          <span
            className={cn(
              "mr-2 shrink-0 transition-[transform,opacity] duration-500",
              EASE,
              open ? "rotate-180 opacity-55" : "rotate-0 opacity-100",
            )}
          >
            <i className="fa-solid fa-caret-left block animate-floating text-4xl text-mainColor drop-shadow-[0.2vh_0.2vh_0.3vh_rgba(0,0,0,0.47)]" />
          </span>

          <div
            {...hoverProps}
            onFocusCapture={(e) => setFocus((e.target as HTMLElement).matches(":focus-visible"))}
            onBlurCapture={() => setFocus(false)}
            className="pointer-events-auto relative h-1/2 w-96 overflow-hidden rounded-md border border-[rgba(44,44,44,0.54)] bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.04)_inset]"
          >
            {/* wallpaper */}
            <div className={cn("absolute inset-0 transition-transform duration-700", EASE, open ? "scale-105" : "translate-x-6 scale-[1.16]")}>
              <div className="perspectiveImg" style={{ backgroundImage: `url("${latest.backgroundImage}")` }} />
            </div>

            <div className="vignette" />
            <div aria-hidden className={cn("pointer-events-none absolute inset-0 z-[4] rounded-md border border-white/15 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />

            {/* summary */}
            <div className={cn("absolute inset-0 z-[3] transition-opacity duration-300", patchesOpen && "opacity-0")}>
              <div className={cn("absolute inset-0 transition-[transform,opacity] duration-500 delay-75", EASE, open ? "translate-x-0 opacity-100" : "translate-x-9 opacity-0")}>
                <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 pt-4">
                  <div className="font-share text-lg tracking-[2.5px] text-inkDim [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                    PATCH <b className="font-medium text-ink">NOTES</b>
                  </div>
                  <div className="text-md font-share tracking-[0.5px] text-mainColor [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">v{versionLabel}</div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-[9px] px-5 pb-4">
                  <div className="font-share text-xs tracking-[1.5px] text-inkFaint">{latest.releaseDate}</div>
                  <div className="text-lg font-bold leading-[1.15] tracking-[0.2px] text-ink">{latest.patchTitle ?? "This week on the server"}</div>
                  <div className="my-[1px] h-px bg-line" />

                  <ul className="m-0 flex list-none flex-col gap-[5px] p-0">
                    {summary.map((h, i) => {
                      const extra = h.updates.length - 1;
                      return (
                        <li
                          key={`${h.type}-${i}`}
                          style={{ transitionDelay: open ? `${160 + i * 70}ms` : "0ms" }}
                          className={cn(
                            "flex items-center gap-2 text-xs leading-[1.3] text-inkDim transition-[transform,opacity] duration-500",
                            EASE,
                            open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                          )}
                        >
                          {highlightConfig[h.type].symbol}
                          <span className="min-w-0 flex-1 truncate">{h.updates[0].text}</span>
                          {extra > 0 && <span className="shrink-0 font-share text-[10px] tracking-[1px] text-inkFaint">+{extra}</span>}
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    aria-expanded={patchesOpen}
                    aria-controls="drawer"
                    onClick={togglePatches}
                    onMouseEnter={() => playSound(3)}
                    className="mb-1.5 mt-[6px] flex w-full cursor-pointer items-center justify-between rounded-sm border border-line bg-[rgba(0,0,0,0.35)] px-[11px] py-2 text-left transition-[background-color,border-color] duration-200 hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(0,0,0,0.5)] focus:outline-none focus-visible:border-mainColor"
                  >
                    <span className="font-share text-xs tracking-[1.8px] text-ink">VIEW ALL PATCHES</span>
                    <i className={cn("fa-solid fa-caret-down text-sm text-inkFaint transition-transform duration-[260ms] ease-out", patchesOpen && "rotate-180")} />
                  </button>
                </div>
              </div>
            </div>

            {/* changelog drawer (always mounted, just slides) */}
            <div
              id="drawer"
              aria-hidden={!patchesOpen}
              className={cn(
                "absolute inset-0 z-[5] flex flex-col bg-black/60 p-4 px-5 transition-[transform,visibility] duration-[400ms] ease-out",
                patchesOpen ? "visible translate-y-0" : "invisible translate-y-full",
              )}
            >
              <div className="mb-3 flex items-center justify-between border-b border-line pb-[8px]">
                <span className="text-md font-share tracking-[1.5px] text-ink">
                  FULL CHANGELOG — <span className="tracking-[0.5px]">v{versionLabel}</span>
                </span>

                <button
                  type="button"
                  aria-label="Close changelog"
                  onClick={() => (playSound(2), setPatchesOpen(false))}
                  onMouseEnter={() => playSound(3)}
                  className="cursor-pointer px-[6px] py-[2px] text-xs leading-none text-inkFaint transition-colors duration-150 hover:text-ink focus:outline-none focus-visible:text-mainColor"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto pr-[2px] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
                {latest.highlights.map((h, i) => {
                  const config = highlightConfig[h.type];
                  return (
                    <div
                      key={`${h.type}-${i}`}
                      style={{ transitionDelay: patchesOpen ? `${180 + i * 80}ms` : "0ms" }}
                      className={cn(
                        "transition-[transform,opacity] duration-500",
                        EASE,
                        patchesOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                      )}
                    >
                      <div className={cn("mb-[6px] font-share text-sm tracking-[2px]", config.labelClassName)}>{config.label}</div>
                      <ul className="m-0 flex list-none flex-col gap-[5px] p-0">
                        {h.updates.map((u, ui) => (
                          <li key={ui} className="flex items-start gap-2 text-xs leading-[1.4] text-inkDim">
                            <span className="mt-[2px] flex h-[1.4em] items-center">{config.symbol}</span>
                            <span>{u.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */

const App: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const [patchesOpen, setPatchesOpen] = useState(false);
  const [patchNote, setPatchNote] = useState<PatchNote | null>(null);
  const [menu, setMenu] = useState<MenuItem[][]>([]);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const handleShowPause = useCallback(() => {
    setVisible(true);
    setOpenKey((k) => k + 1);
    playSound(1);
  }, []);

  const handleUpdateData = useCallback((data: PausemenuData) => {
    setPatchNote(data.patchNotes);
    setMenu(data.menuSections);
  }, []);

  useNuiEvent("showPause", handleShowPause);
  useNuiEvent<PausemenuData>("updateData", handleUpdateData);

  const handleClose = useCallback(() => {
    setVisible(false);
    setPatchesOpen(false);
    playSound(4);
    void Promise.resolve(fetchNui("err_pausemenu:close")).catch(() => undefined);
  }, []);

  const handleMenuAction = useCallback(
    (item: MenuItem) => {
      if (!item.action) return handleClose();

      if (item.action.type === "url") {
        if (typeof (window as any).invokeNative === "function") {
          (window as any).invokeNative("openUrl", item.action.event);
        } else {
          window.open(item.action.event, "_blank", "noopener,noreferrer");
        }
        return;
      }

      handleClose();
      void Promise.resolve(fetchNui("err_pausemenu:click", item.action)).catch(() => undefined);
    },
    [handleClose],
  );

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        patchesOpen ? setPatchesOpen(false) : handleClose();
        return;
      }

      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !patchesOpen) {
        const items = Array.from(menuWrapRef.current?.querySelectorAll<HTMLButtonElement>("nav button") ?? []);
        if (!items.length) return;
        e.preventDefault();

        const down = e.key === "ArrowDown";
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = current === -1 ? (down ? 0 : items.length - 1) : (current + (down ? 1 : -1) + items.length) % items.length;
        items[next].focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, patchesOpen, handleClose]);

  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <div
      ref={menuWrapRef}
      aria-hidden={!visible}
      className={cn("bgGradi fixed inset-0 flex h-full w-full select-none flex-row items-center overflow-hidden transition-[opacity,visibility] duration-[350ms]", visible ? "visible opacity-100" : "pointer-events-none invisible opacity-0")}
    >
      <MenuPanel key={openKey} menu={menu} visible={visible} onAction={handleMenuAction} />
      {patchNote && <PatchCard latest={patchNote} patchesOpen={patchesOpen} setPatchesOpen={setPatchesOpen} />}
    </div>
  );
};

export default App;
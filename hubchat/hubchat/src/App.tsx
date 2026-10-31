import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

type Side = 'in' | 'out';

interface Message {
  id: number;
  side: Side;
  text: string;
}

interface Chat {
  id: number;
  name: string;
  hue: number;
  time: string;
  unread: number;
  messages: Message[];
}

const msgs = (...items: [Side, string][]): Message[] =>
  items.map(([side, text], id) => ({ id, side, text }));

const seed: Chat[] = [
  { id: 1, name: 'سارا احمدی', hue: 280, time: '۱۰:۴۲', unread: 2, messages: msgs(['in', 'سلام، پیش‌نویس پروپوزال رو دیدی؟'], ['out', 'آره، تا عصر نظرم رو می‌گم'], ['in', 'عالیه، ممنون ✨']) },
  { id: 2, name: 'تیم طراحی', hue: 200, time: '۰۹:۱۵', unread: 5, messages: msgs(['in', 'نسخه‌ی جدید فیگما آپلود شد'], ['out', 'دیدم، رنگ‌ها عالی شده'], ['in', 'پس فردا تحویل می‌دیم']) },
  { id: 3, name: 'علی رضایی', hue: 30, time: 'دیروز', unread: 0, messages: msgs(['out', 'فردا جلسه داریم؟'], ['in', 'آره، ساعت ۱۰ صبح']) },
  { id: 4, name: 'مریم کریمی', hue: 150, time: 'دیروز', unread: 0, messages: msgs(['in', 'فایل‌ها رو فرستادم'], ['out', 'دریافت شد، سپاس']) },
  { id: 5, name: 'پشتیبانی Huberr', hue: 340, time: 'شنبه', unread: 1, messages: msgs(['in', 'درخواست شما در حال بررسی است']) },
];

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`ms ${className}`} aria-hidden="true">{name}</span>;
}

function Avatar({ chat, size }: { chat: Chat; size: string }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ background: `hsl(${chat.hue} 45% 42%)` }}
    >
      {chat.name[0]}
    </div>
  );
}

interface ChatListProps {
  chats: Chat[];
  activeId: number | null;
  query: string;
  hiddenOnMobile: boolean;
  onQuery: (q: string) => void;
  onSelect: (id: number) => void;
  onToggleTheme: () => void;
}

function ChatList({ chats, activeId, query, hiddenOnMobile, onQuery, onSelect, onToggleTheme }: ChatListProps) {
  const visible = chats.filter((c) => c.name.includes(query));
  return (
    <aside
      className={`flex w-full flex-col border-e border-outline-variant bg-surface md:w-96 md:shrink-0 ${hiddenOnMobile ? 'max-md:hidden' : ''}`}
    >
      <header className="px-4 pb-2 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-[22px] font-medium leading-7 text-primary">Hubchat</h1>
          <button type="button" onClick={onToggleTheme} aria-label="تغییر تم"
            className="ripple flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant">
            <Icon name="contrast" />
          </button>
        </div>
        <label className="flex h-14 items-center gap-3 rounded-full bg-surface-high px-4 text-on-surface-variant">
          <Icon name="search" />
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="جستجو در گفتگوها"
            className="w-full bg-transparent text-base text-on-surface outline-none placeholder:text-on-surface-variant" />
        </label>
      </header>

      <ul className="flex-1 overflow-y-auto px-2 py-2">
        {visible.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <li key={chat.id}>
              <button type="button" onClick={() => onSelect(chat.id)}
                className={`ripple flex w-full items-center gap-3 rounded-full px-3 py-3 text-start ${chat.id === activeId ? 'bg-secondary-container' : ''}`}>
                <Avatar chat={chat} size="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{chat.name}</div>
                  <div className="truncate text-sm text-on-surface-variant">{last?.text}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-medium leading-4 text-on-surface-variant">{chat.time}</span>
                  {chat.unread > 0 && (
                    <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs text-on-primary">{chat.unread}</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button"
        className="ripple absolute bottom-6 start-6 flex h-14 items-center gap-2 rounded-2xl bg-primary-container px-5 font-medium text-on-primary-container shadow-lg md:static md:m-4 md:self-start">
        <Icon name="edit" />گفتگوی جدید
      </button>
    </aside>
  );
}

interface ConversationProps {
  chat: Chat | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

function Conversation({ chat, onBack, onSend }: ConversationProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.id, chat?.messages.length]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <main className={`flex-1 flex-col bg-surface-container md:flex ${chat ? 'flex' : 'max-md:hidden'}`}>
      {!chat ? (
        <div className="m-auto text-on-surface-variant">یک گفتگو را انتخاب کنید</div>
      ) : (
        <div className="flex h-full flex-col">
          <header className="flex items-center gap-3 bg-surface px-2 py-2 md:px-4">
            <button type="button" onClick={onBack} aria-label="بازگشت"
              className="ripple flex h-10 w-10 items-center justify-center rounded-full md:hidden">
              <Icon name="arrow_forward" />
            </button>
            <Avatar chat={chat} size="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{chat.name}</div>
              <div className="text-xs text-on-surface-variant">آنلاین</div>
            </div>
            <button type="button" aria-label="تماس" className="ripple flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant"><Icon name="call" /></button>
            <button type="button" aria-label="بیشتر" className="ripple flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant"><Icon name="more_vert" /></button>
          </header>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {chat.messages.map((m) => (
              <div key={m.id} className={`flex ${m.side === 'out' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-base leading-6 ${m.side === 'out' ? 'bg-primary-container text-on-primary-container' : 'bg-surface text-on-surface'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 p-3">
            <div className="flex h-14 flex-1 items-center gap-2 rounded-full bg-surface px-4">
              <Icon name="mood" className="text-on-surface-variant" />
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} placeholder="پیام بنویسید…"
                className="w-full bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant" />
              <Icon name="attach_file" className="text-on-surface-variant" />
            </div>
            <button type="button" onClick={submit} aria-label="ارسال"
              className="ripple flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow">
              <Icon name="send" className="-scale-x-100" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>(seed);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState<boolean>(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  const active = chats.find((c) => c.id === activeId) ?? null;

  const select = (id: number) => {
    setActiveId(id);
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = (text: string) => {
    const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, time, messages: [...c.messages, { id: c.messages.length, side: 'out', text }] }
          : c,
      ),
    );
  };

  return (
    <div className="flex h-full">
      <ChatList chats={chats} activeId={activeId} query={query} hiddenOnMobile={active !== null}
        onQuery={setQuery} onSelect={select} onToggleTheme={() => setDark((d) => !d)} />
      <Conversation chat={active} onBack={() => setActiveId(null)} onSend={send} />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronRight, HelpCircle, UserCheck, ShoppingCart,
  Warehouse, Building2, UtensilsCrossed, ArrowRight, Archive,
  Shield, FileText, ArrowLeft, Milk, Calculator, ClipboardList
} from 'lucide-react';

const sections = [
  {
    id: 'overview',
    icon: HelpCircle,
    title: 'Про систему',
    content: (
      <div className="space-y-3">
        <p>My AI Helper — система для автоматизації роботи підприємства. Включає управління заявками на закупівлю (повний цикл: від подання до отримання на складі), оформлення перепусток на ввіз/вивіз, планування меню для кухні, облік молока та розрахунок продуктів.</p>
        <p>Кожен користувач може мати одну або кілька ролей. У верхній частині дашборда відображаються кнопки для перемикання між ролями.</p>
      </div>
    ),
  },
  {
    id: 'roles',
    icon: UserCheck,
    title: 'Ролі користувачів',
    content: (
      <div className="space-y-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200">Заявник (APPLICANT)</h4>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">Створює заявки на закупівлю, переглядає їх статус, редагує відхилені пункти, архівує отримані заявки.</p>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-800 dark:text-red-200">Директорат (DIRECTORATE)</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">Погоджує або відхиляє окремі пункти заявок з обов&rsquo;язковим зазначенням причини відхилення. Переглядає зведену таблицю по всіх заявках.</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Снабження (SUPPLY)</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Замовляє схвалені товари в постачальників, змінює статуси (Замовлено → Сплачено → В дорозі). Оформлює перепустки на ввіз/вивіз товарів.</p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-amber-800 dark:text-amber-200">Склад (WAREHOUSE)</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Приймає товари на складі. Тільки склад може змінити статус з «В дорозі» на «Отримано».</p>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Кухня (KITCHEN)</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Планує меню на тиждень з цінами страв, веде облік молока, розраховує кількість продуктів на порції.</p>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-800 dark:text-purple-200">Адміністратор (ADMIN)</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Керує користувачами: створює, редагує, видаляє, призначає ролі.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'pipeline',
    icon: ArrowRight,
    title: 'Життєвий цикл заявки',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-3">Кожен пункт заявки проходить наступні етапи:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <div><span className="font-medium">Очікує</span><span className="text-sm text-muted-foreground ml-2">— пункт створено, чекає на розгляд директоратом</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
            <div><span className="font-medium">Відхилено</span><span className="text-sm text-muted-foreground ml-2">— директорат відхилив із зазначенням причини. Пункт можна редагувати або видалити</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
            <div><span className="font-medium">Схвалено</span><span className="text-sm text-muted-foreground ml-2">— директорат погодив, товар доступний для замовлення</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
            <div><span className="font-medium">Замовлено</span><span className="text-sm text-muted-foreground ml-2">— снабження зробило замовлення постачальнику</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
            <div><span className="font-medium">Сплачено</span><span className="text-sm text-muted-foreground ml-2">— товар оплачено постачальнику</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
            <div><span className="font-medium">В дорозі</span><span className="text-sm text-muted-foreground ml-2">— товар відправлено, очікується на складі</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
            <div><span className="font-medium">Отримано</span><span className="text-sm text-muted-foreground ml-2">— товар прийнято на складі. Статус може змінити тільки склад</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Archive className="w-4 h-4" />
          <span>Коли всі пункти заявки мають статус «Отримано», заявник може заархівувати заявку кнопкою «Архівувати» в списку своїх заявок.</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowRight className="w-4 h-4" />
          <span>Снабження може змінювати статуси в прямому та зворотному напрямку (крім «Отримано»). Склад може змінити «В дорозі» → «Отримано».</span>
        </div>
      </div>
    ),
  },
  {
    id: 'applicant',
    icon: ShoppingCart,
    title: 'Як створити заявку (заявник)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Заявнику доступні вкладки: <strong>«Мої заявки»</strong>, <strong>«Нове замовлення»</strong>, <strong>«Архів»</strong>.</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Перейдіть на вкладку <strong>«Нове замовлення»</strong>.</li>
          <li>Виберіть пріоритет заявки: Низький, Нормальний, Високий або Терміновий.</li>
          <li>Додайте товари: почніть вводити назву в полі автокомпліту. Якщо товару немає в списку, його можна створити на льоту.</li>
          <li>Вкажіть кількість та одиницю виміру для кожного товару.</li>
          <li>Натисніть <strong>«Створити замовлення»</strong>.</li>
        </ol>
        <p className="text-sm text-muted-foreground">Після створення заявка з&rsquo;являється у вкладці «Мої заявки» зі статусом «Очікує». Ви можете переглядати статуси, редагувати відхилені пункти, видаляти відхилені заявки. Після отримання всіх товарів натисніть «Архівувати».</p>
      </div>
    ),
  },
  {
    id: 'directorate',
    icon: Building2,
    title: 'Як погодити заявку (директорат)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Директорату доступні вкладки: <strong>«Заявки на погодження»</strong>, <strong>«Огляд заявок»</strong>, <strong>«Архів»</strong>.</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки на погодження»</strong> відображаються всі необроблені пункти заявок.</li>
          <li>Натисніть <strong>«Погодити»</strong> або <strong>«Відхилити»</strong> на кожному пункті окремо.</li>
          <li>При відхиленні обов&rsquo;язково вкажіть причину в текстовому полі.</li>
          <li>Вкладка <strong>«Огляд заявок»</strong> показує зведену таблицю зі статусами всіх заявок та можливістю розгорнути кожну для перегляду пунктів.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'supply',
    icon: ShoppingCart,
    title: 'Як замовити товари (снабження)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Снабженню доступні вкладки: <strong>«Заявки на закупівлю»</strong>, <strong>«Архів»</strong>, <strong>«Перепустки»</strong>, а також заготовки «Постачальники» та «Договори».</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки на закупівлю»</strong> відображаються всі схвалені товари.</li>
          <li>Змінюйте статус кожного товару через випадаючий список: Замовлено → Сплачено → В дорозі.</li>
          <li>Статуси можна змінювати як уперед, так і назад (крім «Отримано» — це прерогатива складу).</li>
          <li>Вкладка <strong>«Постачальники»</strong> та <strong>«Договори»</strong> — заготовки для майбутніх функцій.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'passes',
    icon: FileText,
    title: 'Як оформити перепустку',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Функція доступна у відділі снабження на вкладці <strong>«Перепустки»</strong>.</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Виберіть тип перепустки: «Ввіз», «Вивіз» або «Ввіз/Вивіз».</li>
          <li>Виберіть дату початку дії через календар. Дата закінчення розраховується автоматично (+7 днів).</li>
          <li>Додайте товари до перепустки — кожен наступний рядок з&rsquo;являється після заповнення попереднього.</li>
          <li>Максимум 31 позиція в одній перепустці.</li>
          <li>Натисніть <strong>«Зберегти перепустку»</strong> — Excel-файл згенерується і завантажиться автоматично.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'warehouse',
    icon: Warehouse,
    title: 'Як прийняти товар (склад)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Складу доступні вкладки: <strong>«Заявки»</strong>, <strong>«Архів»</strong>, а також заготовки «Приход товару», «Расход товару», «Остатки».</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки»</strong> відображаються товари зі статусом «В дорозі» та «Отримано». Товари згруповані за номером заявки.</li>
          <li>Коли товар фізично прибув на склад, оберіть у випадаючому списку статус <strong>«Отримано»</strong>.</li>
          <li>Ви можете бачити, хто і коли змінював статус кожного товару.</li>
          <li>Після отримання всіх товарів у заявці заявник зможе заархівувати її.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'kitchen',
    icon: UtensilsCrossed,
    title: 'Кухня (планування меню)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Кухні доступні вкладки: <strong>«Меню на тиждень»</strong>, <strong>«Молоко»</strong>, <strong>«Розрахунки»</strong>.</p>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Планування меню</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Встановіть початок тижня через календар — тиждень будується відносно цієї дати.</li>
              <li>Оберіть робочі дні через чекбокси (Пн–Пт). Таблиця покаже лише вибрані дні з правильними датами.</li>
              <li>Для кожного дня та типу страви (Перше, Гарнір, М&rsquo;ясне, Салат, Випічка, Напій) оберіть страву через автокомпліт. В комірці одночасно може бути лише одна страва.</li>
              <li>До кожної страви можна вказати ціну — поруч з автокомплітом є поле для введення ціни. При зміні ціна зберігається автоматично (при втраті фокусу або натисканні Enter).</li>
              <li>Якщо страви з потрібною назвою не існує, автокомпліт запропонує створити нову — з&rsquo;явиться модальне вікно для введення ціни.</li>
              <li>Натисніть <strong>«Експорт PDF»</strong> — згенерується файл з усіма днями, стравами, цінами та підсумком по кожному дню.</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2"><Milk className="w-4 h-4" /> Облік молока</h4>
            <p className="text-sm text-muted-foreground">Модуль в розробці. В майбутньому тут з&rsquo;явиться щоденний трекер витрат молока з датами та залишками.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2"><Calculator className="w-4 h-4" /> Розрахунки</h4>
            <p className="text-sm text-muted-foreground">Модуль в розробці. В майбутньому тут з&rsquo;явиться калькулятор для розрахунку кількості продуктів на задану кількість порцій.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'admin',
    icon: Shield,
    title: 'Адміністрування (керування користувачами)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Адміністратору доступні вкладки: <strong>«Користувачі»</strong>, а також заготовки «Налаштування» та «Логи».</p>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Створення користувача</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Перейдіть на вкладку <strong>«Користувачі» → «Створити»</strong>.</li>
              <li>Заповніть поля: email, пароль, ім&rsquo;я та оберіть одну або кілька ролей.</li>
              <li>Натисніть <strong>«Створити користувача»</strong>.</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-1">Редагування та видалення</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Перейдіть на вкладку <strong>«Користувачі» → «Список»</strong>.</li>
              <li>В таблиці відображаються всі зареєстровані користувачі.</li>
              <li>Натисніть «Редагувати» для зміни email, імені, ролей або пароля.</li>
              <li>Натисніть «Видалити» для видалення користувача.</li>
            </ol>
          </div>
        </div>
      </div>
    ),
  },
];

const Section = ({ section, isOpen, onToggle }) => {
  const Icon = section.icon;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground flex-1">{section.title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-border text-sm text-foreground">
          {section.content}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const router = useRouter();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Допомога</h1>
        </div>
        <p className="text-muted-foreground">
          Інструкція з роботи з системою управління закупівлями, перепустками та плануванням меню.
        </p>

        <div className="space-y-3">
          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              isOpen={openSection === section.id}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

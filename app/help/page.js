'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, UserCheck, ShoppingCart, Warehouse, Building2, UtensilsCrossed, ArrowRight, Archive } from 'lucide-react';

const sections = [
  {
    id: 'overview',
    icon: HelpCircle,
    title: 'Про систему',
    content: (
      <div className="space-y-3">
        <p>My AI Helper — система для управління заявками на закупівлю товарів на підприємстві. Вона автоматизує повний цикл: від подання заявки співробітником до отримання товару на складі.</p>
        <p>Кожен користувач має певну роль, яка визначає його доступ до функцій системи.</p>
      </div>
    ),
  },
  {
    id: 'roles',
    icon: UserCheck,
    title: 'Ролі користувачів',
    content: (
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Заявник (APPLICANT)</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Створює заявки на закупівлю, переглядає їх статус, архівує отримані заявки.</p>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-800 dark:text-purple-200">Директорат (DIRECTORATE)</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Погоджує або відхиляє заявки та окремі пункти заявок. Переглядає зведену таблицю по всіх заявках.</p>
        </div>
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <h4 className="font-medium text-cyan-800 dark:text-cyan-200">Снабження (SUPPLY)</h4>
          <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">Замовляє схвалені товари, змінює статуси (Замовлено → Сплачено → В дорозі). Також оформлює перепустки.</p>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Склад (WAREHOUSE)</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Приймає товари на складі, змінює статус з «В дорозі» на «Отримано».</p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200">Кухня (KITCHEN)</h4>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">Планує меню та управляє стравами (додаткова функція).</p>
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
        <p className="text-sm text-muted-foreground mb-3">Кожна заявка проходить наступні етапи:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <div><span className="font-medium">Очікує</span><span className="text-sm text-muted-foreground ml-2">— заявка створена, чекає на розгляд директоратом</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
            <div><span className="font-medium">Схвалено</span><span className="text-sm text-muted-foreground ml-2">— директорат погодив, товар можна замовляти</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
            <div><span className="font-medium">Відхилено</span><span className="text-sm text-muted-foreground ml-2">— директорат відхилив з вказанням причини</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
            <div><span className="font-medium">Замовлено</span><span className="text-sm text-muted-foreground ml-2">— снабження зробило замовлення постачальнику</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
            <div><span className="font-medium">Сплачено</span><span className="text-sm text-muted-foreground ml-2">— товар оплачено постачальнику</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
            <div><span className="font-medium">В дорозі</span><span className="text-sm text-muted-foreground ml-2">— товар відправлено, очікується на складі</span></div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
            <div><span className="font-medium">Отримано</span><span className="text-sm text-muted-foreground ml-2">— товар прийнято на складі, цикл завершено</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Archive className="w-4 h-4" />
          <span>Після отримання всіх товарів заявник може заархівувати заявку.</span>
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
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Перейдіть на вкладку <strong>«Нове замовлення»</strong>.</li>
          <li>Виберіть пріоритет заявки (Низький, Нормальний, Високий, Терміновий).</li>
          <li>Додайте товари: почніть вводити назву товару в полі автокомпліту. Якщо товару немає в списку, його можна створити на льоту.</li>
          <li>Вкажіть кількість та одиницю виміру для кожного товару.</li>
          <li>Натисніть <strong>«Створити замовлення»</strong>.</li>
        </ol>
        <p className="text-sm text-muted-foreground">Після створення заявка з&rsquo;являється в списку «Мої замовлення» зі статусом «Очікує». Після погодження директоратом і отримання всіх товарів ви можете заархівувати заявку кнопкою «Архівувати».</p>
      </div>
    ),
  },
  {
    id: 'directorate',
    icon: Building2,
    title: 'Як погодити заявку (директорат)',
    content: (
      <div className="space-y-3">
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки на погодження»</strong> відображаються всі необроблені пункти заявок.</li>
          <li>Натисніть <strong>«Погодити»</strong> або <strong>«Відхилити»</strong> на кожному пункті.</li>
          <li>При відхиленні обов&rsquo;язково вкажіть причину.</li>
          <li>Вкладка <strong>«Огляд заявок»</strong> показує зведену інформацію по всіх заявках.</li>
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
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки на закупівлю»</strong> відображаються всі схвалені товари.</li>
          <li>Змінюйте статус кожного товару: Замовлено → Сплачено → В дорозі.</li>
          <li>Можна також змінювати статус назад при необхідності.</li>
          <li>Вкладка <strong>«Перепустки»</strong> дозволяє оформити перепустку на ввіз/вивіз товарів на територію.</li>
          <li>Вкладка <strong>«Архів»</strong> містить заархівовані заявки (не старше 3 років).</li>
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
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Заявки»</strong> відображаються товари зі статусом «В дорозі» та «Отримано».</li>
          <li>Коли товар фізично прибув на склад, змініть статус на <strong>«Отримано»</strong>.</li>
          <li>Після отримання всіх товарів у заявці, заявник зможе заархівувати її.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'passes',
    icon: HelpCircle,
    title: 'Як оформити перепустку',
    content: (
      <div className="space-y-3">
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>На вкладці <strong>«Перепустки»</strong> у відділі закупівель виберіть тип: «Ввіз», «Вивіз» або «Ввіз з наступним вивозом».</li>
          <li>Вкажіть дату початку дії перепустки.</li>
          <li>Додайте товари до перепустки — кожен наступний рядок з&rsquo;являється після заповнення попереднього.</li>
          <li>Максимум 31 позиція в одній перепустці.</li>
          <li>Натисніть <strong>«Зберегти перепустку»</strong>.</li>
        </ol>
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
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Допомога</h1>
        </div>
        <p className="text-muted-foreground">
          Інструкція з роботи з системою управління заявками на закупівлю.
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

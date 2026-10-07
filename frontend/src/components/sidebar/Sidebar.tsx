import { Download, Moon, Search, Star, Sun, Trash2 } from 'lucide-react'
import type { Theme, View } from '../../types'
import './Sidebar.css'

type SidebarProps = {
  theme: Theme
  onToggleTheme: () => void
  view: View
  onChangeView: (view: View) => void
  onExport: () => void
  canExport: boolean
}

const Sidebar = ({
  theme,
  onToggleTheme,
  view,
  onChangeView,
  onExport,
  canExport,
}: SidebarProps) => {
  return (
    <aside className="sidebar glass">
      <h2 className="sidebar-title">
        <Star size={24} color="var(--primary)" />
        Notes App
      </h2>

      <button
        type="button"
        className={`sidebar-btn ${view === 'all' ? 'sidebar-btn--active' : ''}`}
        onClick={() => onChangeView('all')}
      >
        <Search size={20} />
        <span>All Notes</span>
      </button>

      <button
        type="button"
        className={`sidebar-btn ${view === 'favourites' ? 'sidebar-btn--active' : ''}`}
        onClick={() => onChangeView('favourites')}
      >
        <Star size={20} />
        <span>Favourites</span>
      </button>

      <button
        type="button"
        className={`sidebar-btn ${view === 'trash' ? 'sidebar-btn--active' : ''}`}
        onClick={() => onChangeView('trash')}
      >
        <Trash2 size={20} />
        <span>Trash</span>
      </button>

      <div className="sidebar-footer">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onExport}
          disabled={!canExport}
          aria-label="Export notes"
          title={canExport ? 'Export notes' : 'No notes to export'}
        >
          <Download size={20} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
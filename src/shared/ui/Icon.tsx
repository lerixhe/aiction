import React from 'react';
import { Icon as IconifyIcon, addCollection } from '@iconify/react';
import { BUNDLED_TABLER_ICONS } from './bundled-icons';

// Load bundled icons for offline use
addCollection(BUNDLED_TABLER_ICONS);

export type IconName = 
  | 'sparkles'
  | 'wand'
  | 'brain'
  | 'robot'
  | 'bulb'
  | 'flask'
  | 'star'
  | 'stars'
  | 'cpu'
  | 'cpu-2'
  | 'language'
  | 'alphabet-latin'
  | 'article'
  | 'edit'
  | 'pencil'
  | 'typography'
  | 'align-left'
  | 'file-text'
  | 'copy'
  | 'scissors'
  | 'clipboard'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'quote'
  | 'message-circle'
  | 'message'
  | 'messages'
  | 'mail'
  | 'send'
  | 'thumb-up'
  | 'thumb-down'
  | 'at'
  | 'hash'
  | 'phone'
  | 'search'
  | 'zoom-question'
  | 'chart-bar'
  | 'eye'
  | 'report-analytics'
  | 'help-circle'
  | 'info-circle'
  | 'filter'
  | 'sort-ascending'
  | 'list-search'
  | 'code'
  | 'terminal'
  | 'bug'
  | 'git-branch'
  | 'server'
  | 'database'
  | 'brackets'
  | 'terminal-2'
  | 'command'
  | 'variable'
  | 'arrow-right'
  | 'check'
  | 'x'
  | 'refresh'
  | 'download'
  | 'share'
  | 'bookmark'
  | 'heart'
  | 'external-link'
  | 'link'
  | 'home'
  | 'menu'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'compass'
  | 'map'
  | 'route'
  | 'folder'
  | 'file'
  | 'trash'
  | 'archive'
  | 'book'
  | 'note'
  | 'calendar'
  | 'clock'
  | 'tag'
  | 'user'
  | 'users'
  | 'globe'
  | 'lock'
  | 'lock-open'
  | 'key'
  | 'shield'
  | 'alert-circle'
  | 'alert-triangle'
  | 'loader'
  | 'photo'
  | 'camera'
  | 'play'
  | 'pause'
  | 'volume'
  | 'headphones'
  | 'settings'
  | 'adjustments'
  | 'palette'
  | 'api'
  | 'database-export';

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  className = '',
  color 
}) => {
  return (
    <IconifyIcon
      icon={`tabler:${name}`}
      width={size}
      height={size}
      className={className}
      style={color ? { color } : undefined}
    />
  );
};

export default Icon;

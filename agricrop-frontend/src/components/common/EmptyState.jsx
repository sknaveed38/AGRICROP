import React from 'react';
import Button from './Button';
import { FiInbox } from 'react-icons/fi';

/**
 * EmptyState - Standard placeholder for lists/grids with no items.
 */
export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'No items found',
  description = 'There is currently no data in this category.',
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white/40 backdrop-blur-sm">
      <div className="p-4 bg-green-50 rounded-full text-green-700 mb-4 border border-green-100">
        <Icon className="w-10 h-10" />
      </div>
      <h4 className="text-lg font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

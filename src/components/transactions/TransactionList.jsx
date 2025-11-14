import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

export default function TransactionList({ transactions, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <p className="text-gray-400 ml-4">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list-container">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
          <p className="text-gray-400">No hay transacciones registradas</p>
          <p className="text-gray-500 text-sm mt-2">Crea una nueva transacción para comenzar</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMoney = (amount) => {
    return parseInt(amount || 0).toLocaleString('es-CL');
  };

  const getCategoryName = (category) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Sin categoría';
    }
    return category || 'Sin categoría';
  };

  return (
    <div className="transaction-list-container">
      <div className="transaction-list-header">
        <h3 className="text-lg md:text-xl font-bold text-white">Historial de Transacciones</h3>
        <span className="bg-slate-700 text-slate-300 text-xs md:text-sm font-semibold px-3 py-1 rounded-full">
          {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
        </span>
      </div>

      <div className="space-y-2 md:space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="transaction-item bg-gradient-to-r from-slate-800 to-slate-800 border border-slate-700 rounded-lg p-3 md:p-4 hover:border-slate-600 transition-all group"
          >
            {/* Mobile Layout: Vertical Stack */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              
              {/* Left Section: Icon + Info */}
              <div className="flex items-start md:items-center gap-3 md:gap-4 min-w-0 flex-1">
                
                {/* Icon */}
                <div className="flex-shrink-0">
                  {transaction.type === 'income' ? (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                      <ArrowDownCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
                      <ArrowUpCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm md:text-base font-semibold text-white truncate">
                    {transaction.description}
                  </h4>
                  <div className="text-xs md:text-sm text-slate-400 flex flex-wrap gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 bg-slate-700 rounded">
                      {getCategoryName(transaction.category)}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Amount + Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                
                {/* Amount */}
                <div className={`text-right font-bold text-sm md:text-base whitespace-nowrap ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${formatMoney(transaction.amount)}
                </div>

                {/* Action Buttons - RESPONSIVE SIN DUPLICADOS */}
                <div className="flex gap-2">
                  {/* Desktop: Solo iconos con hover opacity */}
                  <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                      title="Editar transacción"
                      type="button"
                    >
                      <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                      title="Eliminar transacción"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  {/* Mobile: Botones con texto siempre visibles */}
                  <div className="md:hidden flex gap-2 flex-1">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Editar transacción"
                      type="button"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="flex-1 py-1 px-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Eliminar transacción"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
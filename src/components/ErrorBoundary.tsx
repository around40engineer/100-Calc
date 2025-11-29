import React, { Component, type ReactNode } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // エラーが発生したら状態を更新
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // エラー情報をコンソールに記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    // ページをリロード
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isPokeApiError = this.state.error?.message.includes('pokemon');

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-100 to-red-200 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                エラーが発生しました
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                問題が発生しました。
              </p>
              
              {isPokeApiError ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    ポケモンの読み込みに失敗しました。
                  </p>
                  <p className="text-sm text-gray-600">
                    インターネット接続を確認してください。
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">
                    予期しないエラーが発生しました。
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={this.handleReload}
              className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              もう一度試す
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

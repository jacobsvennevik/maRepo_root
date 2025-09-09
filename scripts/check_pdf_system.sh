#!/bin/bash

echo "🔍 Quick PDF Processing System Check"
echo "===================================="

# Check if Redis is running
echo -n "📊 Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running"
    echo "   💡 Start with: brew services start redis"
fi

# Check for Celery worker processes
echo -n "⚙️ Celery Workers: "
CELERY_PROCESSES=$(ps aux | grep -c "[c]elery.*worker")
if [ "$CELERY_PROCESSES" -gt 0 ]; then
    echo "✅ $CELERY_PROCESSES running"
    ps aux | grep "[c]elery.*worker" | while read line; do
        echo "   🔧 $line"
    done
else
    echo "❌ None found"
    echo "   💡 Start with: celery -A backend worker --loglevel=info"
fi

# Check Django server
echo -n "🌐 Django: "
if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "✅ Running on port 8000"
else
    echo "❌ Not responding on port 8000"
    echo "   💡 Start with: python manage.py runserver"
fi

# Check recent log files for errors
echo -n "📋 Recent Errors: "
if [ -f "celery.log" ]; then
    ERROR_COUNT=$(tail -100 celery.log | grep -c "ERROR")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "⚠️ $ERROR_COUNT errors in last 100 lines of celery.log"
        echo "   📄 Recent errors:"
        tail -100 celery.log | grep "ERROR" | tail -3 | while read line; do
            echo "   ❌ $line"
        done
    else
        echo "✅ No recent errors in celery.log"
    fi
else
    echo "ℹ️ No celery.log file found"
fi

echo ""
echo "🚀 To run comprehensive diagnostics:"
echo "   python manage.py diagnose_pdf_processing --quick"
echo ""
echo "🧪 To run full test suite:" 
echo "   python manage.py diagnose_pdf_processing" 
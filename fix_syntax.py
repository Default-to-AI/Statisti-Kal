import re

file_path = 'src/components/HypothesisTestingCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will use regex because of potential spaces
content = re.sub(
    r'\? "חד-צדדי ימני: אנו מחפשים שטח עבודה משמאל בגודל <InlineMath math="1-\\\\alpha" />\."',
    r'? <>חד-צדדי ימני: אנו מחפשים שטח עבודה משמאל בגודל <InlineMath math="1-\\\\alpha" />.</>',
    content
)

content = re.sub(
    r': "חד-צדדי ימני \(מבחן t\): אנו מאתרים בקצה הימני שטח ברמת מובהקות <InlineMath math="\\\\alpha" />\."\}',
    r': <>חד-צדדי ימני (מבחן t): אנו מאתרים בקצה הימני שטח ברמת מובהקות <InlineMath math="\\\\alpha" />.</>}',
    content
)

content = re.sub(
    r'\? "חד-צדדי שמאלי: אנו מחפשים שטח קיצון שמאלי בגודל <InlineMath math="\\\\alpha" />\."',
    r'? <>חד-צדדי שמאלי: אנו מחפשים שטח קיצון שמאלי בגודל <InlineMath math="\\\\alpha" />.</>',
    content
)

content = re.sub(
    r': "חד-צדדי שמאלי \(מבחן t\): אנו מחפשים שטח קיצון שמאלי בגודל <InlineMath math="\\\\alpha" /> בהתפלגות <InlineMath math="t" />\."\}',
    r': <>חד-צדדי שמאלי (מבחן t): אנו מחפשים שטח קיצון שמאלי בגודל <InlineMath math="\\\\alpha" /> בהתפלגות <InlineMath math="t" />.</>}',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_mobile/main.dart';

void main() {
  testWidgets('FormCheck AI home screen smoke test', (tester) async {
    await tester.pumpWidget(const FormCheckApp());

    expect(find.text('FormCheck AI'), findsOneWidget);
    expect(find.text('Start exercise'), findsOneWidget);
    expect(find.text('Squat'), findsOneWidget);
    expect(find.text('Push-up'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Plank'), 200);
    expect(find.text('Plank'), findsOneWidget);
  });
}

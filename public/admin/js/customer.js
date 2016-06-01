function customerConfig(nga, admin) {

  var customer = admin.getEntity('customers');

  customer.listView()
    .title('消费者账户')
    .fields([
      nga.field('mobilePhoneNumber').label('手机号'),
      nga.field('createdAt').label('加入时间')
    ])
    .actions([]);

}
